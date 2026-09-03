import type { PageId } from "@/types";

export const PAGE_PATHS: Record<PageId, string> = {
  Dashboard: "/",
  Today: "/today",
  Journal: "/journal",
  Health: "/health",
  Productivity: "/productivity",
  Insights: "/insights",
};

export function pageIdFromPath(pathname: string): PageId {
  const match = (Object.entries(PAGE_PATHS) as [PageId, string][]).find(
    ([, path]) => path === pathname,
  );
  return match?.[0] ?? "Dashboard";
}
