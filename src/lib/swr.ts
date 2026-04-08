/**
 * SWR fetcher and shared configuration.
 *
 * Provides a standard JSON fetcher and reusable config
 * for stale-while-revalidate caching across the app.
 */

export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? "Error de red");
  }
  return res.json() as Promise<T>;
}

/**
 * POST fetcher for SWR — accepts [url, body] tuple as key.
 */
export async function postFetcher<T>([url, body]: [string, unknown]): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? "Error de red");
  }
  return res.json() as Promise<T>;
}
