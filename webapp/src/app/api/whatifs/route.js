// Whatifs
export async function POST(req) {
  const { url } = await req.json();
  const res = await fetch("https://sparknotes-s58d.onrender.com/whatifs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const data = await res.json();
  return Response.json(data);
}
