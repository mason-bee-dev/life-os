/** A single point for the small sparkline charts. */
export type SparkPoint = { i: number; v: number };

/** Sidebar navigation label = current page id. */
export type PageId =
  | "Dashboard"
  | "Today"
  | "Todos"
  | "Journal"
  | "Health"
  | "Productivity"
  | "Insights";
