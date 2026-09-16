import {
  PageBreadcrumb,
  type PageBreadcrumbItem,
} from "@/components/PageBreadcrumb";

type HeaderProps = {
  title: string;
  subtitle: string;
  breadcrumbs?: PageBreadcrumbItem[];
};

export function Header({ title, subtitle, breadcrumbs }: HeaderProps) {
  return (
    <header className="mb-5">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <PageBreadcrumb items={breadcrumbs} className="mb-2" />
      )}
      <div className="min-w-0">
        <h1 className="m-0 break-words text-xl font-bold tracking-tight sm:text-[26px]">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </header>
  );
}
