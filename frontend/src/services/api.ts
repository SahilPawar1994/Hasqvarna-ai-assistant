const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

const DEMO_TOKEN = import.meta.env.VITE_DEMO_TOKEN;

interface QueryResponse {
  answer: string;
}

interface ApiErrorResponse {
  error?: {
    message?: string;
  };
}

export async function submitQuery(query: string): Promise<string> {
  if (!DEMO_TOKEN) {
    throw new Error("Demo authentication token is not configured.");
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEMO_TOKEN}`,
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(25_000),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error("The request timed out. Please try again.");
    }

    throw new Error("Unable to reach the server. Check your connection.");
  }

  const data = (await response.json().catch(() => ({}))) as
    | QueryResponse
    | ApiErrorResponse;

  if (!response.ok) {
    const message = "error" in data ? data.error?.message : undefined;

    throw new Error(message ?? `Request failed (${response.status}).`);
  }

  if (!("answer" in data) || typeof data.answer !== "string") {
    throw new Error("The server returned an unexpected response.");
  }

  return data.answer;
}
