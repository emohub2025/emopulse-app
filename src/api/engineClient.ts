const BASE_URL = 'http://172.236.119.144:4100';

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);

  if (!res.ok) {
    throw new Error(`GET ${path} failed with ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => null);
    console.log("POST error body:", errBody);
    throw new Error(`POST ${path} failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}