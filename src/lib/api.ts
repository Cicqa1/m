import { PolishedCV, User, JobApplication } from "../types";

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${path} failed: ${text}`);
  }
  return res.json();
}

export async function apiGetUserCVs(userId: string): Promise<PolishedCV[]> {
  return apiFetch(`/api/db/users/${encodeURIComponent(userId)}/cvs`);
}

export async function apiSaveUserCV(userId: string, cv: PolishedCV): Promise<void> {
  await apiFetch(`/api/db/users/${encodeURIComponent(userId)}/cvs/${encodeURIComponent(cv.id)}`, {
    method: "PUT",
    body: JSON.stringify(cv),
  });
}

export async function apiDeleteUserCV(userId: string, cvId: string): Promise<void> {
  await apiFetch(`/api/db/users/${encodeURIComponent(userId)}/cvs/${encodeURIComponent(cvId)}`, {
    method: "DELETE",
  });
}

export async function apiSaveUser(user: User): Promise<void> {
  await apiFetch(`/api/db/users/${encodeURIComponent(user.id)}`, {
    method: "PUT",
    body: JSON.stringify(user),
  });
}

export async function apiGetUserApplications(userId: string): Promise<JobApplication[]> {
  return apiFetch(`/api/db/users/${encodeURIComponent(userId)}/applications`);
}

export async function apiSaveUserApplication(userId: string, app: JobApplication): Promise<void> {
  await apiFetch(`/api/db/users/${encodeURIComponent(userId)}/applications`, {
    method: "POST",
    body: JSON.stringify(app),
  });
}
