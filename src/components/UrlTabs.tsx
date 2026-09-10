import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type UrlTabItem = {
  value: string;
  label: React.ReactNode;
};

type UrlTabsProps = {
  items: UrlTabItem[];
  defaultValue: string;
  /** Query param key. Default: `tab`. */
  paramName?: string;
  children: React.ReactNode;
  className?: string;
  listClassName?: string;
  triggerClassName?: string;
};

export function UrlTabs({
  items,
  defaultValue,
  paramName = "tab",
  children,
  className,
  listClassName,
  triggerClassName,
}: UrlTabsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const allowed = new Set(items.map((item) => item.value));
  const fromUrl = searchParams.get(paramName);
  const value =
    fromUrl && allowed.has(fromUrl) ? fromUrl : defaultValue;

  const onValueChange = (next: string) => {
    setSearchParams(
      (prev) => {
        const nextParams = new URLSearchParams(prev);
        nextParams.set(paramName, next);
        return nextParams;
      },
      { replace: true },
    );
  };

  return (
    <Tabs value={value} onValueChange={onValueChange} className={className}>
      <TabsList
        className={cn(
          "flex h-auto w-full flex-wrap justify-start gap-1 sm:inline-flex sm:h-10 sm:w-auto sm:flex-nowrap",
          listClassName,
        )}
      >
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className={cn("flex-1 sm:flex-none", triggerClassName)}
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}
