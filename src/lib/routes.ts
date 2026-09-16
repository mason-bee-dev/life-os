import type { PageId } from "@/types";

export const PAGE_PATHS: Record<PageId, string> = {
  Dashboard: "/dashboard",
  Today: "/today",
  Todos: "/todos",
  Journal: "/journal",
  Health: "/health",
  Sleep: "/sleep",
  Utilities: "/utilities",
  Productivity: "/productivity",
  Insights: "/insights",
};

/** Default landing page when entering the app (sidebar: Thói quen). */
export const DEFAULT_PAGE_PATH = PAGE_PATHS.Health;

export function pageIdFromPath(pathname: string): PageId {
  const match = (Object.entries(PAGE_PATHS) as [PageId, string][]).find(
    ([, path]) => path === pathname,
  );
  return match?.[0] ?? "Health";
}
