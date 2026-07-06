export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, category } = req.body;

  if (!amount) {
    return res.status(400).json({ error: "Amount required" });
  }

  // Map GreenSpend categories to Climatiq activity IDs (verified 2025)
  const activityMap = {
    petrol:               "consumer_goods-type_motor_gasoline",
    flight:               "consumer_goods-type_air_travel",
    fast_fashion:         "consumer_goods-type_clothing",
    fast_food:            "consumer_goods-type_food_and_drink",
    gas_energy:           "consumer_goods-type_natural_gas",
    organic_grocery:      "consumer_goods-type_food_and_drink",
    ev_charging:          "consumer_goods-type_electricity",
    renewable_energy:     "consumer_goods-type_electricity",
    surplus_food:         "consumer_goods-type_food_and_drink",
    sustainable_fashion:  "consumer_goods-type_clothing",
    charity:              "consumer_goods-type_other",
    oat_coffee:           "consumer_goods-type_food_and_drink",
    neutral:              "consumer_goods-type_other",
  };

  const activityId = activityMap[category] || "consumer_goods-type_other";

  try {
    const response = await fetch("https://api.climatiq.io/data/v1/estimate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLIMATIQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emission_factor: {
          activity_id: activityId,
          data_version: "^33",
          region: "GB",
        },
        parameters: {
          money: amount,
          money_unit: "gbp",
        },
      }),
    });

    const data = await response.json();

    // Log the full response to help debug
    console.log("Climatiq response:", JSON.stringify(data));

    if (data.error) {
      // Fallback to BEIS 2024 factors if Climatiq fails
      const BEIS = {
        petrol: 0.236, flight: 0.990, fast_fashion: 0.127,
        fast_food: 0.297, gas_energy: 0.038, organic_grocery: -0.020,
        ev_charging: -0.032, renewable_energy: -0.061, surplus_food: -0.514,
        sustainable_fashion: -0.025, charity: -0.140, oat_coffee: -0.024,
        neutral: 0.000,
      };
      const fallback = parseFloat(((BEIS[category] ?? 0) * amount).toFixed(2));
      return res.status(200).json({ co2e: fallback, source: "beis_fallback" });
    }

    res.status(200).json({ co2e: data.co2e ?? 0, source: "climatiq" });
  } catch (err) {
    // Fallback to BEIS 2024 on any error
    const BEIS = {
      petrol: 0.236, flight: 0.990, fast_fashion: 0.127,
      fast_food: 0.297, gas_energy: 0.038, organic_grocery: -0.020,
      ev_charging: -0.032, renewable_energy: -0.061, surplus_food: -0.514,
      sustainable_fashion: -0.025, charity: -0.140, oat_coffee: -0.024,
      neutral: 0.000,
    };
    const fallback = parseFloat(((BEIS[category] ?? 0) * amount).toFixed(2));
    res.status(200).json({ co2e: fallback, source: "beis_fallback" });
  }
}