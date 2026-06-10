export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  try {
    const response = await fetch(
      "https://auth.truelayer-sandbox.com/connect/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: process.env.TRUELAYER_CLIENT_ID,
          client_secret: process.env.TRUELAYER_CLIENT_SECRET,
          redirect_uri: process.env.TRUELAYER_REDIRECT_URI,
          code,
        }),
      }
    );

    const data = await response.json();

    if (!data.access_token) {
      return res.status(400).json({ error: "Failed to get token", detail: data });
    }

    // Redirect back to the app with the token in the URL
    res.redirect(`/?token=${data.access_token}`);
  } catch (err) {
    res.status(500).json({ error: "Token exchange failed", detail: err.message });
  }
}