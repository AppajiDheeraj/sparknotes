// Mindmap
export async function POST(req) {
  const { url } = await req.json();
  const res = await fetch("http://localhost:5000/whatifs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const data = await res.json();
  return Response.json(data);
}
