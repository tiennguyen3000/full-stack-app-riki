export function apiError(message: string, status = 400, details?: unknown) {
  return Response.json({ error: message, details: details ?? null }, { status });
}

export async function readJson(req: Request): Promise<unknown | null> {
  try {
    const t = await req.text();
    if (!t) return null;
    return JSON.parse(t);
  } catch {
    return null;
  }
}

export function parsePagination(sp: URLSearchParams) {
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
  const raw = parseInt(sp.get("pageSize") || "12", 10) || 12;
  const pageSize = Math.min(50, Math.max(1, raw));
  return { page, pageSize };
}

export function paginated<T>(data: T[], total: number, p: { page: number; pageSize: number }) {
  const totalPages = Math.max(1, Math.ceil(total / p.pageSize));
  return { data, meta: { page: p.page, pageSize: p.pageSize, total, totalPages } };
}
