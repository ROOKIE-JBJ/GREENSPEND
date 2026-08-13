export const CONFIG = {
  weights: { carbon: 50, green: 20, social: 15, transparency: 15 },

  // Carbon intensity band, kg CO2e per £. Working assumptions — see §8.
  carbonBounds: { best: 0.10, worst: 1.20 },

  greenShareTarget: 0.25,     // share of categorised spend for full green marks
  donationShareTarget: 0.03,  // share of total spend for full social marks

  minTransactions: 15,
  minAssessableSpend: 100,

  // Lower-impact categories. Membership is independent of whether a carbon
  // factor exists yet: taking the train is low-impact behaviour either way.
  greenCategories: new Set([
    'rail',
    'bus',
    'public_transport',
    'second_hand',
    'repair',
  ]),

  // kg CO2e per £1 spent.
  //   number → usable
  //   null   → no factor yet; spend is reported as unmeasured, never as zero-carbon
  factors: {
    petrol: 1.33,
    diesel: 1.48,
    gas_heating: 2.49,
    rail: 0.22,
    electricity: 0.50,
    ev_charging_home: 0.50,
    ev_charging_public: 0.16,
    clothing: 0.869,
    soft_drinks: 0.565,
    groceries: 0.35,
    restaurants: 0.30,
    air_transport: null,
    bus: null,
    public_transport: null,
    second_hand: null,
    repair: null,
  },

  // Factors not yet confirmed against the primary published dataset.
  // Surfaced in the result so a score is never presented as more certain
  // than the data behind it.
  provisionalFactors: new Set([
    'groceries',            // placeholder, pending COICOP extraction
    'restaurants',          // placeholder, pending COICOP extraction
    'electricity',          // grid factor scope unconfirmed
    'ev_charging_home',
    'ev_charging_public',   // price is a market estimate
  ]),
};

export function computeGreenFinancialScore(transactions, config = CONFIG) {
  if (!Array.isArray(transactions)) {
    throw new TypeError('transactions must be an array');
  }
  if (transactions.length < config.minTransactions) {
    return notEnoughData(
      `Need at least ${config.minTransactions} transactions to produce a score.`
    );
  }

  const t = tally(transactions, config);

  if (t.assessableSpend < config.minAssessableSpend) {
    return notEnoughData(
      `Need at least £${config.minAssessableSpend} of spend in categories we can currently measure.`,
      t
    );
  }

  const { carbon, green, social, transparency } = config.weights;

  // ---- Pillar 1: carbon intensity (§3.1) ----
  const intensity = t.totalCarbon / t.assessableSpend;
  const { best, worst } = config.carbonBounds;
  const carbonPts = clamp(carbon * (worst - intensity) / (worst - best), 0, carbon);

  // ---- Pillar 2: green behaviour (§3.2) ----
  // Denominator is categorised spend, not assessable spend, so the pillar does
  // not move as carbon factors are filled in.
  const greenShare = safeDiv(t.greenSpend, t.categorisedSpend);
  const greenPts = green * Math.min(greenShare / config.greenShareTarget, 1);

  // ---- Pillar 3: social impact (§3.3) ----
  const donationShare = safeDiv(t.donationSpend, t.totalSpend);
  const socialPts = social * Math.min(donationShare / config.donationShareTarget, 1);

  // ---- Pillar 4: transparency (§3.4) ----
  // Cash is invisible. Unmeasured spend is visible but not yet measurable;
  // both reduce how much of this person's spending the score actually covers.
  const measuredSpend = t.traceableSpend - t.unscoredSpend;
  const transparencyPts = transparency * safeDiv(measuredSpend, t.totalSpend);

  const total = carbonPts + greenPts + socialPts + transparencyPts;

  return {
    score: Math.round(total),
    status: 'ok',
    intensity: round2(intensity),

    breakdown: {
      carbon: round1(carbonPts),
      green: round1(greenPts),
      social: round1(socialPts),
      transparency: round1(transparencyPts),
    },

    shares: {
      greenShareOfCategorised: round3(greenShare),
      donationShareOfTotal: round3(donationShare),
      measuredShareOfTotal: round3(safeDiv(measuredSpend, t.totalSpend)),
    },

    totals: {
      totalSpend: round2(t.totalSpend),
      traceableSpend: round2(t.traceableSpend),
      categorisedSpend: round2(t.categorisedSpend),
      assessableSpend: round2(t.assessableSpend),
      cashSpend: round2(t.cashSpend),
      donationSpend: round2(t.donationSpend),
      unscoredSpend: round2(t.unscoredSpend),
      totalCarbonKg: round1(t.totalCarbon),
    },

    // Never present a score as more certain than the data behind it.
    dataQuality: {
      hasUnmeasuredSpend: t.unscoredSpend > 0,
      unmeasuredShareOfCategorised: round3(safeDiv(t.unscoredSpend, t.categorisedSpend)),
      hasProvisionalFactors: t.provisionalSpend > 0,
      provisionalShareOfCarbon: round3(safeDiv(t.provisionalCarbon, t.totalCarbon)),
      unmeasuredCategories: [...new Set(t.unscored.map(x => x.category))],
    },

    unscored: t.unscored,
  };
}

// ---------------------------------------------------------------------------

function tally(transactions, config) {
  let totalSpend = 0;
  let cashSpend = 0;
  let donationSpend = 0;
  let assessableSpend = 0;   // has a carbon factor
  let unscoredSpend = 0;     // categorised, but no factor yet
  let totalCarbon = 0;
  let greenSpend = 0;
  let provisionalSpend = 0;
  let provisionalCarbon = 0;
  const unscored = [];

  for (const tx of transactions) {
    const amount = Number(tx.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      throw new RangeError(`Invalid transaction amount: ${tx.amount}`);
    }
    totalSpend += amount;

    // Cash: excluded from carbon because we cannot see how it was spent (§3.1)
    if (tx.type === 'cash') {
      cashSpend += amount;
      continue;
    }

    // Donations: excluded from carbon so the same positive act is not
    // counted twice, and never recorded as negative carbon (§3.3)
    if (tx.type === 'donation') {
      donationSpend += amount;
      continue;
    }

    // Green behaviour is a property of the category, counted before the
    // factor lookup so the pillar does not depend on factor availability.
    if (config.greenCategories.has(tx.category)) {
      greenSpend += amount;
    }

    const factor = config.factors[tx.category];

    // No factor: this spend is NOT assessable. Adding it to the denominator
    // of carbon intensity while contributing nothing to the numerator would
    // let unmeasured spending raise the score.
    if (factor == null) {
      unscored.push({ category: tx.category, amount });
      unscoredSpend += amount;
      continue;
    }

    assessableSpend += amount;
    totalCarbon += amount * factor;

    if (config.provisionalFactors.has(tx.category)) {
      provisionalSpend += amount;
      provisionalCarbon += amount * factor;
    }
  }

  const traceableSpend = totalSpend - cashSpend;
  const categorisedSpend = traceableSpend - donationSpend;

  return {
    totalSpend, cashSpend, donationSpend,
    traceableSpend, categorisedSpend, assessableSpend, unscoredSpend,
    totalCarbon, greenSpend, provisionalSpend, provisionalCarbon, unscored,
  };
}

function notEnoughData(reason, t) {
  return {
    score: null,
    status: 'not_enough_data',
    reason,
    totals: t ? { totalSpend: round2(t.totalSpend), assessableSpend: round2(t.assessableSpend) } : undefined,
  };
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const safeDiv = (a, b) => (b > 0 ? a / b : 0);
const round1 = v => Math.round(v * 10) / 10;
const round2 = v => Math.round(v * 100) / 100;
const round3 = v => Math.round(v * 1000) / 1000;