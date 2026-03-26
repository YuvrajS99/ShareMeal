import React, { useMemo, useState } from "react";
import { Trophy } from "lucide-react";

// Mock leaderboard data (no backend endpoint currently).
const MOCK_DONORS = [
  { donorName: "Aarav Singh", totalDonations: 12, points: 350 },
  { donorName: "Priya Verma", totalDonations: 9, points: 280 },
  { donorName: "Sara Khan", totalDonations: 7, points: 220 },
  { donorName: "Rahul Mehta", totalDonations: 6, points: 205 },
  { donorName: "Neha Joshi", totalDonations: 4, points: 150 },
  { donorName: "Imran Ali", totalDonations: 3, points: 120 }
];

export default function Leaderboard() {
  const [sortKey] = useState("points");

  const rows = useMemo(() => {
    const cloned = [...MOCK_DONORS];
    cloned.sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));
    return cloned;
  }, [sortKey]);

  return (
    <div className="pageWrap">
      <section className="pageCard">
        <div className="pageHeader">
          <div>
            <h1 style={{ margin: 0 }}>Leaderboard</h1>
            <div className="pageHint" style={{ marginTop: 6 }}>
              Top donors ranked by points.
            </div>
          </div>
          <div className="pageIcon">
            <Trophy size={20} />
          </div>
        </div>

        <div className="tableWrap" role="region" aria-label="Leaderboard table">
          <table className="table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Donor Name</th>
                <th>Total Donations</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.donorName}>
                  <td className="rankCell">#{idx + 1}</td>
                  <td>{r.donorName}</td>
                  <td>{r.totalDonations}</td>
                  <td className="pointsCell">{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="smallText" style={{ marginTop: 14 }}>
          Points logic: 10 per donation + accepted (20) + completed (50).
        </div>
      </section>
    </div>
  );
}

