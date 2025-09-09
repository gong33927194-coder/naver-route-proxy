// Kakao Mobility Directions v1 프록시 (Vercel Serverless Function)
export default async function handler(req, res) {
  try {
    const { o, d } = req.query;                  // o="lon,lat", d="lon,lat"
    const [oLon, oLat] = (o || "").split(",").map(Number);
    const [dLon, dLat] = (d || "").split(",").map(Number);

    if ([oLon, oLat, dLon, dLat].some(v => Number.isNaN(v))) {
      return res.status(400).json({ error: "bad params", hint: "use lon,lat" });
    }

    const endpoint =
      `https://apis-navi.kakaomobility.com/v1/directions` +
      `?origin=${oLon},${oLat}&destination=${dLon},${dLat}` +
      `&priority=RECOMMEND&summary=true`;

    const r = await fetch(endpoint, {
      headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_KEY}` }
    });

    const text = await r.text();
    if (!r.ok) {
      return res
        .status(r.status)
        .setHeader("Access-Control-Allow-Origin", "*")
        .json({ error: "kakao-error", status: r.status, body: text });
    }

    const j = JSON.parse(text);
    // Kakao 응답: summary.duration(초), summary.distance(미터)
    const sec  = j?.routes?.[0]?.summary?.duration ?? null;
    const dist = j?.routes?.[0]?.summary?.distance ?? null;

    return res
      .status(200)
      .setHeader("Access-Control-Allow-Origin", "*")
      .json({ durationSec: typeof sec === "number" ? sec : null, distanceMeters: dist, raw: j });
  } catch (e) {
    return res
      .status(500)
      .setHeader("Access-Control-Allow-Origin", "*")
      .json({ error: "server-exception", message: String(e) });
  }
}
