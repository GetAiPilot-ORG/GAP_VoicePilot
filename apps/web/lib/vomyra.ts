const DEFAULT_VOMYRA_BASE_URL = "https://api.vomyra.com";

function getVomyraConfig() {
  const apiKey = process.env.VOMYRA_API_KEY;
  if (!apiKey) {
    throw new Error("VOMYRA_API_KEY is not configured.");
  }

  return {
    apiKey,
    baseUrl: (process.env.VOMYRA_BASE_URL || DEFAULT_VOMYRA_BASE_URL).replace(/\/$/, ""),
  };
}

export function vomyraRequest(path: string, init: RequestInit = {}) {
  const { apiKey, baseUrl } = getVomyraConfig();
  const headers = new Headers(init.headers);
  headers.set("x-api-key", apiKey);

  return fetch(`${baseUrl}${path.startsWith("/") ? path : `/${path}`}`, {
    ...init,
    headers,
  });
}

export async function fetchVomyraCalls(limit: number) {
  const response = await vomyraRequest(`/v1/calls?limit=${limit}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Vomyra calls request failed (${response.status}).`);
  }

  return response.json();
}

export async function fetchVomyraNumbers() {
  const response = await vomyraRequest("/v1/numbers", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Vomyra numbers request failed (${response.status}).`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : (data.phone_numbers || data.data || []);
}
