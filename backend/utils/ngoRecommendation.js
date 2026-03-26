function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value) {
  const normalized = normalizeText(value);
  if (!normalized) return [];
  return normalized
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length >= 3);
}

function hashToInt(str) {
  const s = normalizeText(str);
  if (!s) return 0;
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) {
    hash = (hash * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function computeLocationScore(ngoLocation, pickupAddress) {
  const ngoLoc = normalizeText(ngoLocation);
  const pickup = normalizeText(pickupAddress);

  if (!ngoLoc || !pickup) return 0;
  if (ngoLoc === "unknown") return 0;

  // Strong match when one side contains the other.
  if (pickup.includes(ngoLoc) || ngoLoc.includes(pickup)) return 10;

  const ngoTokens = tokenize(ngoLoc);
  const pickupTokens = tokenize(pickup);
  if (ngoTokens.length === 0 || pickupTokens.length === 0) return 0;

  const pickupSet = new Set(pickupTokens);
  let overlap = 0;
  for (const tok of ngoTokens) {
    if (pickupSet.has(tok)) overlap += 1;
  }

  // Each shared token adds a bit of score.
  const score = overlap * 2;
  return Math.min(10, score);
}

function computeUrgencyScore(expiryTimeRaw, nowMs = Date.now()) {
  if (!expiryTimeRaw) return 0;

  const expiryMs = new Date(expiryTimeRaw).getTime();
  if (Number.isNaN(expiryMs)) return 0;

  const hoursLeft = (expiryMs - nowMs) / 36e5;

  // Higher score for more urgent donations.
  if (hoursLeft <= 0) return 15;
  if (hoursLeft <= 6) return 14;
  if (hoursLeft <= 24) return 11;
  if (hoursLeft <= 48) return 8;
  if (hoursLeft <= 72) return 5;
  return 3;
}

function computeDistanceKm(ngoLocation, pickupAddress, locationScore = 0) {
  // Mock distance for UI: deterministic, and nudged by location overlap.
  const base = 1 + (hashToInt(`${ngoLocation}|${pickupAddress}`) % 121) / 10; // 1.0 - 13.0
  const adjusted = base - locationScore * 0.3;
  return Math.max(0.5, Math.round(adjusted * 10) / 10);
}

function bestMatchReason() {
  // Requirement-specific reason string.
  return "Best match based on capacity + urgency";
}

function computeNGOScore(ngo, { pickupAddress, expiryTime }) {
  const capacityScore = (ngo.capacity || 0) * 0.5;
  const ratingScore = ((ngo.rating || 0) * 10) * 0.5;

  const locationScore = computeLocationScore(ngo.location, pickupAddress);
  const urgencyScore = computeUrgencyScore(expiryTime, Date.now());

  const totalScore = capacityScore + ratingScore + locationScore + urgencyScore;

  const distanceKm = computeDistanceKm(ngo.location, pickupAddress, locationScore);
  const reason = bestMatchReason();

  return {
    totalScore,
    distanceKm,
    reason,
    meta: { capacityScore, ratingScore, locationScore, urgencyScore }
  };
}

function findBestNGO(ngos, inputs = {}) {
  const { pickupAddress = "", expiryTime = "" } = inputs || {};

  let bestNGO = null;
  let bestScore = -Infinity;
  let bestDistanceKm = null;
  let bestReason = bestMatchReason();

  for (const ngo of ngos) {
    const score = computeNGOScore(ngo, { pickupAddress, expiryTime });
    if (score.totalScore > bestScore) {
      bestScore = score.totalScore;
      bestNGO = ngo;
      bestDistanceKm = score.distanceKm;
      bestReason = score.reason;
    }
  }

  return { bestNGO, bestScore, bestDistanceKm, bestReason };
}

module.exports = {
  findBestNGO
};

