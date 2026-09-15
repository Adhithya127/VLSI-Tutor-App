export interface DashboardStats {
  xp: number;
  level: number;
  xp_in_level: number;
  concepts_mastered: number;
  total_concepts: number;
  total_attempts: number;
  correct_attempts: number;
  pending_reviews: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("vlsi_token");
}

export function setToken(token: string) {
  localStorage.setItem("vlsi_token", token);
}

export function clearToken() {
  localStorage.removeItem("vlsi_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail || `Request failed: ${res.status}`);
  }

  return res.json();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return request<DashboardStats>("/api/v1/dashboard/stats");
}

export async function getMe(): Promise<User> {
  return request<User>("/api/v1/auth/me");
}

export async function login(
  username: string,
  password: string,
): Promise<TokenResponse> {
  const body = new URLSearchParams({ username, password });
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Login failed");
  }
  return res.json();
}

export async function register(payload: {
  email: string;
  username: string;
  password: string;
}): Promise<User> {
  return request<User>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface ModuleSummary {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  subject: string;
  order: number;
  milestone_id: number | null;
  lesson_count: number;
}

export interface LessonSummary {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  duration_minutes: number;
  order: number;
  module_id: string;
  content: string | null;
}

export interface ModuleDetail extends ModuleSummary {
  lessons: LessonSummary[];
}

export interface MilestoneInfo {
  id: number;
  module_count: number;
}

export async function getModules(
  milestoneId?: number,
): Promise<ModuleSummary[]> {
  const params = milestoneId !== undefined ? `?milestone_id=${milestoneId}` : "";
  return request<ModuleSummary[]>(`/api/v1/curriculum/modules${params}`);
}

export async function getModule(moduleId: string): Promise<ModuleDetail> {
  return request<ModuleDetail>(`/api/v1/curriculum/modules/${moduleId}`);
}

export async function getLesson(lessonId: string): Promise<LessonSummary> {
  return request<LessonSummary>(`/api/v1/curriculum/lessons/${lessonId}`);
}

export async function getMilestones(): Promise<MilestoneInfo[]> {
  return request<MilestoneInfo[]>("/api/v1/curriculum/milestones");
}
