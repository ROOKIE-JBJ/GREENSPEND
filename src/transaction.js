export default async function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "No token provided" });
  }

  try {
    // Step 1: Get accounts
    const accountsRes = await fetch(
      "https://api.truelayer-sandbox.com/data/v1/accounts",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const accountsData = await accountsRes.json();

    if (!accountsData.results || accountsData.results.length === 0) {
      return res.status(400).json({ error: "No accounts found" });
    }

    const accountId = accountsData.results[0].account_id;

    // Step 2: Get transactions for the first account
    const txRes = await fetch(
      `https://api.truelayer-sandbox.com/data/v1/accounts/${accountId}/transactions`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const txData = await txRes.json();

    res.status(200).json(txData.results || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transactions", detail: err.message });
  }
}