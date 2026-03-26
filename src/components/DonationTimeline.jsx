import React, { useMemo } from "react";

const STAGES = [
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "picked", label: "Picked" },
  { key: "completed", label: "Completed" }
];

export default function DonationTimeline({ status }) {
  const currentIndex = useMemo(() => {
    const idx = STAGES.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  }, [status]);

  return (
    <div className="timeline" aria-label="Donation timeline">
      <div className="timelineRow">
        {STAGES.map((s, idx) => {
          const isActive = idx <= currentIndex;
          return (
            <React.Fragment key={s.key}>
              <div className={`timelineStep ${isActive ? "timelineStepActive" : ""}`}>
                <div className={`timelineDot ${isActive ? "timelineDotActive" : ""}`} />
                <div className="timelineLabel">{s.label}</div>
              </div>
              {idx < STAGES.length - 1 && (
                <div
                  className={`timelineLine ${idx < currentIndex ? "timelineLineActive" : ""}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

