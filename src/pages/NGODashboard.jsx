import React, { useEffect, useState } from "react";
import { api } from "../services/api.js";
import DonationCard from "../components/DonationCard.jsx";

export default function NGODashboard() {
  const [activeTab, setActiveTab] = useState("pending");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [pendingDonations, setPendingDonations] = useState([]);
  const [acceptedDonations, setAcceptedDonations] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoadingKey, setActionLoadingKey] = useState(null);

  async function loadPending() {
    const data = await api.getPendingDonations();
    setPendingDonations(data?.count !== undefined ? data?.donations || [] : []);
  }

  async function loadAccepted() {
    const data = await api.getAcceptedDonations();
    setAcceptedDonations(data?.count !== undefined ? data?.donations || [] : []);
  }

  async function refreshAll() {
    setLoading(true);
    setError("");
    try {
      await Promise.all([loadPending(), loadAccepted()]);
    } catch (err) {
      setError(err.message || "Failed to load donations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
  }, []);

  async function onAccept(id) {
    setError("");
    const key = `accept:${id}`;
    setActionLoadingKey(key);
    try {
      const acceptedResp = await api.acceptDonation(id);
      setPendingDonations((prevPending) => {
        const donationFromPending = prevPending.find((d) => d._id === id);
        if (!donationFromPending) return prevPending;

        // Move to accepted list immediately to keep donor info (donationController
        // doesn't populate donorId on PATCH responses).
        const updated = {
          ...donationFromPending,
          status: acceptedResp?.donation?.status || "accepted",
          ngoId: acceptedResp?.donation?.ngoId || donationFromPending.ngoId
        };

        setAcceptedDonations((prevAccepted) => [...prevAccepted, updated]);
        return prevPending.filter((d) => d._id !== id);
      });
    } catch (err) {
      setError(err.message || "Failed to accept donation");
    } finally {
      setActionLoadingKey(null);
    }
  }

  async function onPick(id) {
    setError("");
    const key = `picked:${id}`;
    setActionLoadingKey(key);
    try {
      const resp = await api.markPicked(id);
      const updatedStatus = resp?.donation?.status || "picked";
      setAcceptedDonations((prev) =>
        prev.map((d) =>
          d._id === id
            ? {
                ...d,
                ...resp?.donation,
                status: updatedStatus,
                // Preserve populated donor info from the UI copy.
                donorId: d.donorId
              }
            : d
        )
      );
    } catch (err) {
      setError(err.message || "Failed to mark as picked");
    } finally {
      setActionLoadingKey(null);
    }
  }

  async function onComplete(id) {
    setError("");
    const key = `completed:${id}`;
    setActionLoadingKey(key);
    try {
      await api.markCompleted(id);
      setAcceptedDonations((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      setError(err.message || "Failed to mark as completed");
    } finally {
      setActionLoadingKey(null);
    }
  }

  function renderPending() {
    if (loading) return <div className="emptyState">Loading...</div>;
    if (pendingDonations.length === 0)
      return <div className="emptyState">No pending donations right now.</div>;

    return (
      <div className="cardsGrid">
        {pendingDonations.map((d) => (
          <DonationCard
            key={d._id}
            donation={d}
            actions={[
              {
                label: actionLoadingKey === `accept:${d._id}` ? "Accepting..." : "Accept",
                variant: "actionPrimary",
                disabled: actionLoadingKey === `accept:${d._id}`,
                onClick: () => onAccept(d._id)
              }
            ]}
          />
        ))}
      </div>
    );
  }

  function renderAccepted() {
    if (loading) return <div className="emptyState">Loading...</div>;
    if (acceptedDonations.length === 0)
      return (
        <div className="emptyState">
          No accepted donations. Accept one from the Pending tab.
        </div>
      );

    return (
      <div className="cardsGrid">
        {acceptedDonations.map((d) => {
          const actions = [];

          if (d.status === "accepted") {
            actions.push({
              label:
                actionLoadingKey === `picked:${d._id}` ? "Marking..." : "Picked",
              variant: "actionPrimary",
              disabled: actionLoadingKey === `picked:${d._id}`,
              onClick: () => onPick(d._id),
              key: "picked"
            });
          }

          if (d.status === "picked") {
            actions.push({
              label:
                actionLoadingKey === `completed:${d._id}`
                  ? "Completing..."
                  : "Completed",
              variant: "actionPrimary",
              disabled: actionLoadingKey === `completed:${d._id}`,
              onClick: () => onComplete(d._id),
              key: "completed"
            });
          }

          return (
            <DonationCard
              key={d._id}
              donation={d}
              actions={actions}
              assignedNGO={d.ngoId}
            />
          );
        })}
      </div>
    );
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

      <aside
        className={`sidebar ${mobileSidebarOpen ? "" : "sidebarHidden"}`}
      >
        <div className="sidebarTitle">NGO Navigation</div>
        <button
          type="button"
          className={`sidebarBtn ${
            activeTab === "pending" ? "sidebarBtnActive" : ""
          }`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Donations
        </button>
        <button
          type="button"
          className={`sidebarBtn ${
            activeTab === "accepted" ? "sidebarBtnActive" : ""
          }`}
          onClick={() => setActiveTab("accepted")}
        >
          Accepted Donations
        </button>
        <div className="sidebarTitle" style={{ marginTop: 14 }}>
          Workflow
        </div>
        <div className="pageHint">Accept → Pick → Complete</div>
      </aside>

      <section className="pageCard">
        <div className="pageHeader">
          <div>
            <h2 className="pageTitle">
              {activeTab === "pending" ? "Pending Donations" : "Accepted Donations"}
            </h2>
            <div className="pageHint">
              {activeTab === "pending"
                ? "Review and accept donations to start pickup."
                : "Mark pickups as picked, then completed."}
            </div>
          </div>
        </div>

        {error && <div className="errorBox">{error}</div>}

        {activeTab === "pending" ? renderPending() : renderAccepted()}
      </section>
    </div>
  );
}

