export type StrapiResponse<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function fetchStrapi<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    next: { revalidate: 60 },
    ...init
  } as RequestInit);
  if (!res.ok) throw new Error(`Strapi HTTP ${res.status}`);
  return (await res.json()) as T;
}
