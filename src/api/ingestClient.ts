import { INGEST_URL } from "../../config";

const BASE_URL = INGEST_URL;

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);

  if (!res.ok) {
    throw new Error(`GET ${path} failed with ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`POST ${path} failed with ${res.status}`);
  }

  return res.json() as Promise<T>;
}
