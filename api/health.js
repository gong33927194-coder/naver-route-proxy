export default function handler(req, res) {
  const idLen  = process.env.NAVER_ID  ? process.env.NAVER_ID.length  : 0;
  const keyLen = process.env.NAVER_KEY ? process.env.NAVER_KEY.length : 0;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    ok: idLen > 0 && keyLen > 0,
    idLen,
    keyLen
  });
}
