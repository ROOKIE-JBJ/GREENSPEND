export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { description, amount } = req.body;

  if (!description) {
    return res.status(400).json({ error: "Description required" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: `You are a financial transaction categoriser for a carbon scoring app.

Transaction: "${description}", £${amount}

Respond ONLY with a valid JSON object, no extra text:
{
  "category": "one of: petrol | flight | fast_fashion | fast_food | gas_energy | organic_grocery | ev_charging | renewable_energy | surplus_food | sustainable_fashion | charity | oat_coffee | neutral",
  "merchant": "clean short merchant name (max 3 words)",
  "greenSwap": "one short eco-friendly alternative (max 8 words)"
}`,
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "{}";

    // Strip any markdown fences if present
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    res.status(200).json(parsed);
  } catch (err) {
    // Fallback if AI call fails
    res.status(200).json({
      category: "neutral",
      merchant: description.slice(0, 20),
      greenSwap: "Consider a greener alternative",
    });
  }
}