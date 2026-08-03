export const CONFIG = {
  weights: { carbon: 50, green: 20, social: 15, transparency: 15 },
  carbonBounds: { best: 0.10, worst: 1.20 },
  greenShareTarget: 0.25,
  donationShareTarget: 0.03,
  minTransactions: 15,
  minAssessableSpend: 100,
  greenCategories: new Set(["rail", "public_transport", "second_hand", "repair"]),

  
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
    air_transport: null, // no factor yet — excluded from scoring
    bus: null,
  },
};

export function computeGreenFinancialScore(transactions, config = CONFIG) {
  if (transactions.length < config.minTransactions) {
    return { score: null, status: "not_enough_data", reason: `Need ${config.minTransactions}+ transactions.` };
  }

  let totalSpend = 0, cashSpend = 0, donationSpend = 0;
  let assessableSpend = 0, totalCarbon = 0, greenSpend = 0;
  const unscored = [];

  for (const tx of transactions) {
    totalSpend += tx.amount;

    if (tx.type === "cash") { cashSpend += tx.amount; continue; }
    if (tx.type === "donation") { donationSpend += tx.amount; continue; }

    assessableSpend += tx.amount;
    const factor = config.factors[tx.category];

    if (factor == null) {
      unscored.push(tx);
      continue;
    }

    totalCarbon += tx.amount * factor;
    if (config.greenCategories.has(tx.category)) greenSpend += tx.amount;
  }

  if (assessableSpend < config.minAssessableSpend) {
    return { score: null, status: "not_enough_data", reason: `Need £${config.minAssessableSpend}+ assessable spend.` };
  }

  const intensity = totalCarbon / assessableSpend;
  const { best, worst } = config.carbonBounds;
  const carbonPts = clamp(config.weights.carbon * (worst - intensity) / (worst - best), 0, config.weights.carbon);

  const greenPts = config.weights.green * Math.min((greenSpend / assessableSpend) / config.greenShareTarget, 1);
  const socialPts = config.weights.social * Math.min((donationSpend / totalSpend) / config.donationShareTarget, 1);
  const transparencyPts = config.weights.transparency * ((totalSpend - cashSpend) / totalSpend);

  return {
    score: Math.round(carbonPts + greenPts + socialPts + transparencyPts),
    breakdown: {
      carbon: round1(carbonPts),
      green: round1(greenPts),
      social: round1(socialPts),
      transparency: round1(transparencyPts),
    },
    totals: {
      totalSpend: round2(totalSpend),
      assessableSpend: round2(assessableSpend),
      totalCarbonKg: round1(totalCarbon),
    },
    unscored,
  };
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function round1(v) { return Math.round(v * 10) / 10; }
function round2(v) { return Math.round(v * 100) / 100; }