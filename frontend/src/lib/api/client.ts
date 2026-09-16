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

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  message_count: number;
}

export interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export async function createConversation(
  title?: string,
): Promise<Conversation> {
  return request<Conversation>("/api/v1/chat/conversations", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export async function getConversations(): Promise<Conversation[]> {
  return request<Conversation[]>("/api/v1/chat/conversations");
}

export async function getMessages(
  conversationId: string,
): Promise<Message[]> {
  return request<Message[]>(
    `/api/v1/chat/conversations/${conversationId}/messages`,
  );
}

export async function sendMessageStream(
  conversationId: string,
  content: string,
  lessonId?: string,
  onChunk?: (text: string) => void,
  onDone?: () => void,
  onError?: (error: string) => void,
): Promise<void> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const body: Record<string, string> = { content };
  if (lessonId) {
    body.lesson_id = lessonId;
  }

  const res = await fetch(
    `${API_BASE}/api/v1/chat/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    onError?.(err?.detail || `Request failed: ${res.status}`);
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    onError?.("No response body");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const data = JSON.parse(line);
        if (data.text) {
          onChunk?.(data.text);
        }
        if (data.error) {
          onError?.(data.error);
          return;
        }
        if (data.done) {
          onDone?.();
          return;
        }
      } catch {
        // skip malformed lines
      }
    }
  }

  onDone?.();
}

export interface Exercise {
  id: string;
  lesson_id: string | null;
  concept_id: string | null;
  title: string;
  exercise_type: string;
  difficulty: number;
  question: string;
  options: string | null;
  correct_answer: string | null;
  explanation: string | null;
  xp_reward: number;
}

export interface ExerciseResult {
  attempt_id: string;
  exercise_id: string;
  is_correct: boolean;
  correct_answer: string | null;
  explanation: string | null;
  xp_earned: number;
  total_xp: number;
}

export interface ExerciseStats {
  total: number;
  attempted: number;
  correct: number;
}

export async function getExercisesForLesson(
  lessonId: string,
): Promise<Exercise[]> {
  return request<Exercise[]>(`/api/v1/exercises/lesson/${lessonId}`);
}

export async function getLessonExerciseStats(
  lessonId: string,
): Promise<ExerciseStats> {
  return request<ExerciseStats>(`/api/v1/exercises/lesson/${lessonId}/stats`);
}

export async function submitExercise(
  exerciseId: string,
  answer: string,
  timeSeconds?: number,
): Promise<ExerciseResult> {
  return request<ExerciseResult>(`/api/v1/exercises/${exerciseId}/submit`, {
    method: "POST",
    body: JSON.stringify({ answer, time_seconds: timeSeconds }),
  });
}

export async function getExerciseOverview(): Promise<{
  total_exercises: number;
  attempted: number;
  correct: number;
  accuracy: number;
}> {
  return request("/api/v1/exercises/stats/overview");
}

export interface LessonProgressItem {
  lesson_id: string;
  completed: boolean;
  score: number;
  time_spent_minutes: number;
  completed_at: string | null;
}

export interface ProgressOverview {
  total_lessons: number;
  completed_lessons: number;
  total_modules: number;
  completed_modules: number;
  total_exercises: number;
  correct_exercises: number;
  accuracy: number;
  total_xp: number;
  level: number;
  xp_in_level: number;
  streak_days: number;
}

export async function markLessonComplete(
  lessonId: string,
  score?: number,
  timeMinutes?: number,
): Promise<{ status: string; lesson_id: string }> {
  const params = new URLSearchParams();
  if (score !== undefined) params.set("score", String(score));
  if (timeMinutes !== undefined)
    params.set("time_spent_minutes", String(timeMinutes));
  const qs = params.toString() ? `?${params.toString()}` : "";
  return request(`/api/v1/progress/lessons/${lessonId}/complete${qs}`, {
    method: "POST",
  });
}

export async function getLessonProgressList(): Promise<LessonProgressItem[]> {
  return request<LessonProgressItem[]>("/api/v1/progress/lessons");
}

export async function getLessonProgress(
  lessonId: string,
): Promise<LessonProgressItem> {
  return request<LessonProgressItem>(`/api/v1/progress/lessons/${lessonId}`);
}

export async function getProgressOverview(): Promise<ProgressOverview> {
  return request<ProgressOverview>("/api/v1/progress/overview");
}
