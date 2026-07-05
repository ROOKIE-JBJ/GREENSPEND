export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, category } = req.body;

  if (!amount) {
    return res.status(400).json({ error: "Amount required" });
  }

  // Map GreenSpend categories to Climatiq activity IDs
  const activityMap = {
    petrol:               "passenger_vehicle-vehicle_type_car-fuel_source_petrol-engine_size_na-vehicle_age_na-vehicle_weight_na",
    flight:               "passenger_flight-route_type_na-aircraft_type_na-distance_na-class_na-rf_na",
    fast_fashion:         "consumer_goods-type_clothing",
    fast_food:            "consumer_goods-type_food_and_drink",
    gas_energy:           "energy-source_grid_mix",
    organic_grocery:      "consumer_goods-type_food_and_drink",
    ev_charging:          "electricity-supply_grid-source_residual_mix",
    renewable_energy:     "electricity-supply_grid-source_wind",
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
        },
        parameters: {
          money: amount,
          money_unit: "gbp",
        },
      }),
    });

    const data = await response.json();
    res.status(200).json({ co2e: data.co2e ?? 0 });
  } catch (err) {
    res.status(500).json({ error: "Scoring failed", detail: err.message });
  }
}