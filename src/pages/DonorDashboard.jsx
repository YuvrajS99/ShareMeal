import React, { useEffect, useMemo, useState } from "react";
import { api } from "../services/api.js";
import DonationCard from "../components/DonationCard.jsx";
import DonationTimeline from "../components/DonationTimeline.jsx";
import { jsPDF } from "jspdf";

export default function DonorDashboard() {
  const [activeTab, setActiveTab] = useState("create");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [foodType, setFoodType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiryTime, setExpiryTime] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [myDonations, setMyDonations] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [lastCreated, setLastCreated] = useState(null);

  const [recommended, setRecommended] = useState(null);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [recommendedError, setRecommendedError] = useState("");

  async function loadMyDonations() {
    setLoadingList(true);
    setError("");
    try {
      const data = await api.getMyDonations();
      let donations = data?.donations || [];

      const pending = donations.filter((d) => d.status === "pending");
      if (pending.length > 0) {
        await Promise.all(
          pending.map(async (d) => {
            try {
              await api.assignRecommendation(d._id);
            } catch (err) {
              if (err?.response?.status === 404) {
                setRecommendedError("No NGO available");
              }
            }
          })
        );

        const refreshed = await api.getMyDonations();
        donations = refreshed?.donations || donations;
      }

      setMyDonations(donations);
    } catch (err) {
      setError(err.message || "Failed to load donations");
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadMyDonations();
  }, []);

  const recommendationInputs = useMemo(() => {
    const resolvedPickup = lastCreated?.pickupAddress || pickupAddress || "";
    const resolvedExpiry = lastCreated?.expiryTime || expiryTime || "";
    return { pickupAddress: resolvedPickup, expiryTime: resolvedExpiry };
  }, [expiryTime, lastCreated, pickupAddress]);

  useEffect(() => {
    const timer = setTimeout(() => {
      (async () => {
        setLoadingRecommended(true);
        setRecommendedError("");
        try {
          const data = await api.getRecommendedNGO(recommendationInputs);
          setRecommended(data);
        } catch (err) {
          if (err?.response?.status === 404) {
            setRecommendedError("No NGO available");
          } else {
            setRecommendedError(err.message || "Failed to load recommendation");
          }
        } finally {
          setLoadingRecommended(false);
        }
      })();
    }, 450);

    return () => clearTimeout(timer);
  }, [recommendationInputs]);

  const totals = useMemo(() => {
    const totalDonations = myDonations.length;

    // Points rules:
    // - 1 donation = 10 points
    // - accepted = +20
    // - picked = +20 (after accepted)
    // - completed = +50 (instead of the accepted bonus)
    let points = 0;

    for (const d of myDonations) {
      points += 10;
      if (d.status === "completed") points += 50;
      else if (d.status === "accepted" || d.status === "picked") points += 20;
    }

    return { totalDonations, points };
  }, [myDonations]);

  const [exportingPdf, setExportingPdf] = useState(false);

  function getAssignedNGOName(d) {
    if (d?.assignedNGO && typeof d.assignedNGO === "object") return d.assignedNGO.name;
    if (typeof d?.assignedNGO === "string") return d.assignedNGO;
    if (d?.ngoId && typeof d.ngoId === "object") return d.ngoId.name;
    return "";
  }

  async function downloadPdf() {
    setExportingPdf(true);
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const marginX = 36;

      let y = 52;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("ShareMeal Donation History", marginX, y);
      y += 22;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(17, 24, 39);
      doc.text(`Total Donations: ${totals.totalDonations}`, marginX, y);
      y += 16;
      doc.text(`Total Points: ${totals.points}`, marginX, y);
      y += 16;

      if (recommended && recommended?.recommendedNGO) {
        doc.text(`Recommended NGO: ${recommended.recommendedNGO}`, marginX, y);
        y += 16;
      }

      y += 10;
      doc.setFont("helvetica", "bold");
      doc.text("Donations", marginX, y);
      y += 16;
      doc.setFont("helvetica", "normal");

      const linesPerPageStartY = 92;
      const maxY = 770;

      myDonations.forEach((d, idx) => {
        const assigned = getAssignedNGOName(d) || "Not assigned";
        const dateText = d?.expiryTime ? new Date(d.expiryTime).toLocaleDateString() : "";
        const info = `${idx + 1}. ${d.foodType} | Qty: ${d.quantity} | Expires: ${dateText} | Status: ${d.status} | NGO: ${assigned}`;

        const wrapped = doc.splitTextToSize(info, pageWidth - marginX * 2);
        if (y + wrapped.length * 14 > maxY) {
          doc.addPage();
          y = linesPerPageStartY;
        }

        wrapped.forEach((ln) => {
          doc.text(ln, marginX, y);
          y += 14;
        });
        y += 6;
      });

      doc.save("sharemeal_donation_history.pdf");
    } finally {
      setExportingPdf(false);
    }
  }

  async function onCreate(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("foodType", foodType.trim());
      payload.append("quantity", quantity.trim());
      payload.append(
        "expiryTime",
        expiryTime ? new Date(expiryTime).toISOString() : ""
      );
      payload.append("pickupAddress", pickupAddress.trim());
      if (imageFile) payload.append("image", imageFile);

      const data = await api.createDonation(payload);
      const assignedNGO = data?.assignedNGO || null;
      const donation = data?.donation;

      const nextDonation = donation ? { ...donation, assignedNGO } : null;
      setLastCreated(nextDonation);

      if (nextDonation?._id && nextDonation.status === "pending") {
        try {
          const assignRes = await api.assignRecommendation(nextDonation._id);
          setRecommended(assignRes);
        } catch (assignErr) {
          if (assignErr?.response?.status === 404) {
            setRecommendedError("No NGO available");
          }
        }
      }

      // Optimistic update so totals/points update immediately.
      if (nextDonation?._id) {
        setMyDonations((prev) => {
          const alreadyExists = prev.some((d) => d._id === nextDonation._id);
          if (alreadyExists) return prev;
          return [...prev, nextDonation];
        });
      }

      // Refresh to reconcile with backend (population/any server-side changes).
      await loadMyDonations();
      setActiveTab("list");

      setFoodType("");
      setQuantity("");
      setExpiryTime("");
      setPickupAddress("");
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      setError(err.message || "Failed to create donation");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dashboardGrid">
      <button
        type="button"
        className="mobileSidebarToggle"
        onClick={() => setMobileSidebarOpen((v) => !v)}
      >
        Menu
      </button>

      <aside className={`sidebar ${mobileSidebarOpen ? "" : "sidebarHidden"}`}>
        <div className="sidebarTitle">Donor Navigation</div>
        <button
          type="button"
          className={`sidebarBtn ${
            activeTab === "create" ? "sidebarBtnActive" : ""
          }`}
          onClick={() => setActiveTab("create")}
        >
          Create Donation
        </button>
        <button
          type="button"
          className={`sidebarBtn ${
            activeTab === "list" ? "sidebarBtnActive" : ""
          }`}
          onClick={() => setActiveTab("list")}
        >
          My Donations
        </button>
        <div className="sidebarTitle" style={{ marginTop: 14 }}>
          Tip
        </div>
        <div className="pageHint">
          Your donation status updates as the NGO completes pickup.
        </div>
      </aside>

      <section className="pageCard">
        <div className="pageHeader">
          <div>
            <h2 className="pageTitle">
              {activeTab === "create" ? "Create a Donation" : "My Donations"}
            </h2>
            <div className="pageHint">
              {activeTab === "create"
                ? "Share excess food for fast pickup."
                : "Track every donation you submitted."}
            </div>
          </div>

          {activeTab === "list" && (
            <button
              type="button"
              className="secondaryBtn"
              onClick={downloadPdf}
              disabled={exportingPdf}
              title="Download donation history as PDF"
            >
              {exportingPdf ? (
                <>
                  <span className="spinner" /> Generating...
                </>
              ) : (
                "Download PDF"
              )}
            </button>
          )}
        </div>

        {error && <div className="errorBox">{error}</div>}

        {activeTab === "create" && (
          <form className="form" onSubmit={onCreate}>
            <div>
              <div className="fieldLabel">Food Type</div>
              <input
                className="input"
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                required
                placeholder="e.g., Rice, Bread, Cooked Meals"
              />
            </div>

            <div>
              <div className="fieldLabel">Quantity</div>
              <input
                className="input"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                placeholder="e.g., 10 kg, 50 packs"
              />
            </div>

            <div>
              <div className="fieldLabel">Expiry Time</div>
              <input
                className="input"
                type="datetime-local"
                value={expiryTime}
                onChange={(e) => setExpiryTime(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="fieldLabel">Pickup Address</div>
              <textarea
                className="input"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                required
                placeholder="Full address and landmark"
                rows={4}
              />
            </div>

            <div>
              <div className="fieldLabel">Food Image (optional)</div>
              <input
                className="input"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setImagePreview(url);
                  } else {
                    setImagePreview(null);
                  }
                }}
              />
              {imagePreview && (
                <div style={{ marginTop: 10 }}>
                  <img
                    src={imagePreview}
                    alt="Food preview"
                    style={{
                      width: "100%",
                      maxHeight: 220,
                      objectFit: "cover",
                      borderRadius: 16,
                      border: "1px solid var(--border)"
                    }}
                  />
                </div>
              )}
            </div>

            <button className="primaryBtn" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner" /> Submitting...
                </>
              ) : (
                "Create Donation"
              )}
            </button>

            {lastCreated && (
              <div className="topNote" role="status">
                Created donation with status{" "}
                <strong>{lastCreated.status}</strong> and assigned NGO{" "}
                <strong>
                  {lastCreated?.assignedNGO?.name ||
                    lastCreated?.ngoId?.name ||
                    lastCreated?.assignedNGO ||
                    lastCreated?.ngoId ||
                    "Not assigned"}
                </strong>
                .
              </div>
            )}
          </form>
        )}

        {activeTab === "list" && (
          <>
            {loadingList ? (
              <div className="emptyState">Loading...</div>
            ) : myDonations.length === 0 ? (
              <>
                <div className="cardsGrid dashboardSummaryGrid">
                  <div className="card">
                    <div className="cardRow">
                      <div className="cardKey">Total Donations</div>
                      <div className="cardVal">{totals.totalDonations}</div>
                    </div>
                    <div className="cardRow">
                      <div className="cardKey">Total Points</div>
                      <div className="cardVal">{totals.points}</div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="cardRow">
                      <div className="cardKey">Recommended NGO</div>
                      <div className="cardVal">
                        {loadingRecommended
                          ? "Loading..."
                          : recommended?.recommendedNGO || "Not available"}
                      </div>
                    </div>
                    <div className="cardRow">
                      <div className="cardKey">Score</div>
                      <div className="cardVal">
                        {loadingRecommended ? "-" : recommended?.score ?? "—"}
                      </div>
                    </div>
                    <div className="cardRow">
                      <div className="cardKey">Distance</div>
                      <div className="cardVal">
                        {loadingRecommended
                          ? "-"
                          : recommended?.distanceKm != null
                            ? `${recommended.distanceKm} km`
                            : "—"}
                      </div>
                    </div>
                    <div className="cardRow">
                      <div className="cardKey">Reason</div>
                      <div className="cardVal" style={{ whiteSpace: "normal" }}>
                        {loadingRecommended
                          ? "-"
                          : recommended?.reason || "—"}
                      </div>
                    </div>
                    {recommendedError && (
                      <div className="smallText" style={{ marginTop: 8 }}>
                        {recommendedError}
                      </div>
                    )}
                  </div>
                </div>

                <div className="emptyState" style={{ marginTop: 14 }}>
                  No donations yet. Create one to get started.
                </div>
              </>
            ) : (
              <>
                <div className="cardsGrid dashboardSummaryGrid">
                  <div className="card">
                    <div className="cardRow">
                      <div className="cardKey">Total Donations</div>
                      <div className="cardVal">{totals.totalDonations}</div>
                    </div>
                    <div className="cardRow">
                      <div className="cardKey">Total Points</div>
                      <div className="cardVal">{totals.points}</div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="cardRow">
                      <div className="cardKey">Recommended NGO</div>
                      <div className="cardVal">
                        {loadingRecommended
                          ? "Loading..."
                          : recommended?.recommendedNGO || "Not available"}
                      </div>
                    </div>
                    <div className="cardRow">
                      <div className="cardKey">Score</div>
                      <div className="cardVal">
                        {loadingRecommended
                          ? "-"
                          : recommended?.score ?? "—"}
                      </div>
                    </div>
                    <div className="cardRow">
                      <div className="cardKey">Distance</div>
                      <div className="cardVal">
                        {loadingRecommended
                          ? "-"
                          : recommended?.distanceKm != null
                            ? `${recommended.distanceKm} km`
                            : "—"}
                      </div>
                    </div>
                    <div className="cardRow">
                      <div className="cardKey">Reason</div>
                      <div className="cardVal" style={{ whiteSpace: "normal" }}>
                        {loadingRecommended
                          ? "-"
                          : recommended?.reason || "—"}
                      </div>
                    </div>
                    {recommendedError && (
                      <div className="smallText" style={{ marginTop: 8 }}>
                        {recommendedError}
                      </div>
                    )}
                  </div>
                </div>

                <div className="cardsGrid donationCardsGrid">
                  {myDonations.map((d) => (
                    <div className="donationStack" key={d._id}>
                      <DonationCard
                        donation={d}
                        assignedNGO={d.assignedNGO || d.ngoId}
                      />
                      <DonationTimeline status={d.status} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}

