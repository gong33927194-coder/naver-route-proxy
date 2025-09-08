// Vercel 서버리스 함수용
export default async function handler(req, res) {
  try {
    const { o, d } = req.query;
    const [oLon, oLat] = (o || "").split(",").map(Number);
    const [dLon, dLat] = (d || "").split(",").map(Number);

    if ([oLon, oLat, dLon, dLat].some(v => Number.isNaN(v))) {
      return res.status(400).json({ error: "bad params" });
    }

    const endpoint =
      `https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving` +
      `?start=${oLon},${oLat}&goal=${dLon},${dLat}`;

    const r = await fetch(endpoint, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": process.env.NAVER_ID,
        "X-NCP-APIGW-API-KEY": process.env.NAVER_KEY
      }
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(502).setHeader("Access-Control-Allow-Origin", "*")
        .json({ error: "naver-error", status: r.status, body: text });
    }

    const j = await r.json();
    const ms = j?.route?.traoptimal?.[0]?.summary?.duration ?? null;
    const dist = j?.route?.traoptimal?.[0]?.summary?.distance ?? null;
    const durationSec = typeof ms === "number" ? Math.round(ms / 1000) : null;

    res.status(200).setHeader("Access-Control-Allow-Origin", "*")
      .json({ durationSec, distanceMeters: dist, raw: j });
  } catch (e) {
    res.status(500).setHeader("Access-Control-Allow-Origin", "*")
      .json({ error: "exception", message: String(e) });
  }
}
