import React from "react";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

function resolveNgoName(ngoValue) {
  if (!ngoValue) return "";
  if (typeof ngoValue === "string") return ngoValue;
  if (typeof ngoValue === "object" && ngoValue.name) return ngoValue.name;
  return "";
}

function resolveImageSrc(image) {
  if (!image) return null;
  if (typeof image !== "string") return null;

  // Backend returns image paths like "/uploads/donations/<file>".
  if (image.startsWith("/uploads/")) {
    return `${API_BASE_URL}${image}`;
  }

  // If backend later returns an absolute URL, keep it.
  if (image.startsWith("http://") || image.startsWith("https://")) return image;

  return `${API_BASE_URL}/${image.replace(/^\/+/, "")}`;
}

function statusClass(status) {
  switch (status) {
    case "pending":
      return "badge badgePending";
    case "accepted":
      return "badge badgeAccepted";
    case "picked":
      return "badge badgePicked";
    case "completed":
      return "badge badgeCompleted";
    case "cancelled":
      return "badge badgeCancelled";
    default:
      return "badge";
  }
}

export default function DonationCard({ donation, assignedNGO, actions = [] }) {
  const donorName =
    donation?.donorId?.name || donation?.donorId?.email || donation?.donorId;

  const ngoValue =
    resolveNgoName(assignedNGO) ||
    resolveNgoName(donation?.ngoId) ||
    (typeof donation?.ngoId === "string" ? donation.ngoId : "") ||
    "";

  const imageSrc = resolveImageSrc(donation?.image);

  return (
    <div className="card">
      <div className="cardTop">
        <div className="cardTitleRow">
          <h3 className="cardTitle">{donation?.foodType || "Donation"}</h3>
          <span className={statusClass(donation?.status)}>{donation?.status}</span>
        </div>
        <div className="cardMeta">
          <div>
            <span className="metaLabel">Quantity:</span>{" "}
            <span className="metaValue">{donation?.quantity}</span>
          </div>
          <div>
            <span className="metaLabel">Expiry:</span>{" "}
            <span className="metaValue">{formatDate(donation?.expiryTime)}</span>
          </div>
        </div>
      </div>

      {imageSrc && (
        <div className="donationImageWrap">
          <img className="donationImage" src={imageSrc} alt="Food donation" />
        </div>
      )}

      <div className="cardBody">
        <div className="cardRow">
          <div className="cardKey">Pickup</div>
          <div className="cardVal">{donation?.pickupAddress}</div>
        </div>
        <div className="cardRow">
          <div className="cardKey">Donor</div>
          <div className="cardVal">{donorName || "N/A"}</div>
        </div>
        <div className="cardRow">
          <div className="cardKey">Assigned NGO</div>
          <div className="cardVal">{ngoValue || "Not assigned"}</div>
        </div>
      </div>

      {actions.length > 0 && (
        <div className="cardActions">
          {actions.map((a) => (
            <button
              key={a.key || a.label}
              type="button"
              className={`actionBtn ${a.variant || "actionPrimary"}`}
              onClick={a.onClick}
              disabled={a.disabled}
              aria-disabled={a.disabled}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

