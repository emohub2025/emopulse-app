// src/api/client.ts
export async function apiPost(path: string, body: any) {
  const res = await fetch(`http://172.236.119.144:4100/mobile${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Request failed");
  }

  return res.json();
}