/** Per-field messages, plus `form` for errors that aren't about one field. */
export type FormErrors<Field extends string> = Partial<Record<Field | 'form', string>>;

export type ApiResult<T, Field extends string = never> =
  | { ok: true; data: T }
  /** `status` is 0 when the server couldn't be reached. */
  | { ok: false; status: number; errors: FormErrors<Field> };

type Options = { method?: 'GET' | 'POST'; body?: unknown; token?: string };

/** Calls one of the app's `/api/*` routes and returns its JSON or its `errors`. */
export async function apiRequest<T, Field extends string = never>(
  path: string,
  { method = 'GET', body, token }: Options = {},
): Promise<ApiResult<T, Field>> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    return {
      ok: false,
      status: 0,
      errors: { form: 'Couldn’t reach the server. Check your connection and try again.' },
    } as ApiResult<T, Field>;
  }

  const data = await response.json().catch(() => ({}));
  if (response.ok) return { ok: true, data };
  return {
    ok: false,
    status: response.status,
    errors: data.errors ?? { form: 'Something went wrong. Please try again.' },
  } as ApiResult<T, Field>;
}
