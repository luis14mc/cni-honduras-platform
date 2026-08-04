/** Result of a server-side CMS/API fetch for empty vs error UX. */
export type AsyncData<T> =
  | { status: "ok"; data: T }
  | { status: "error"; data: T };

export async function loadAsyncData<T>(
  loader: () => Promise<T>,
  empty: T,
): Promise<AsyncData<T>> {
  try {
    return { status: "ok", data: await loader() };
  } catch {
    return { status: "error", data: empty };
  }
}
