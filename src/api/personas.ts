import type { Persona } from "../personas";

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";
const PERSONAS_ENDPOINT = API_BASE ? `${API_BASE}/api/personas` : "/api/personas";

export type PersonaPayload = {
  userId?: string;
  userName: string;
  avatarUrl?: string;
  bio?: string;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(
      typeof message?.error === "string"
        ? message.error
        : `Request failed (${response.status})`
    );
  }
  return (response.status === 204 ? (null as T) : response.json()) as Promise<T>;
}

export async function fetchPersonas(): Promise<Persona[]> {
  const response = await fetch(PERSONAS_ENDPOINT, { headers: { Accept: "application/json" } });
  const payload = await handleResponse<{ items: Persona[] }>(response);
  return payload?.items ?? [];
}

export async function createPersona(payload: PersonaPayload): Promise<Persona> {
  const response = await fetch(PERSONAS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Persona>(response);
}

export async function updatePersona(userId: string, payload: PersonaPayload): Promise<Persona> {
  const response = await fetch(`${PERSONAS_ENDPOINT}/${encodeURIComponent(userId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Persona>(response);
}

export async function deletePersona(userId: string): Promise<void> {
  const response = await fetch(`${PERSONAS_ENDPOINT}/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
  await handleResponse<null>(response);
}
