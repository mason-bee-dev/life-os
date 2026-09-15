import { TabsContent } from "@/components/ui/tabs";
import { UrlTabs } from "@/components/UrlTabs";
import { QrBankGrid } from "./QrBankGrid";

const UTILITY_TABS = [
  { value: "qr-bank", label: "QR-Bank" },
  { value: "other", label: "Tiện ích khác" },
] as const;

export function Utilities() {
  return (
    <div className="mx-auto flex w-full flex-col gap-4 px-0 py-1">
      <UrlTabs items={[...UTILITY_TABS]} defaultValue="qr-bank">
        <TabsContent value="qr-bank">
          <QrBankGrid />
        </TabsContent>
        <TabsContent value="other">
          <p className="text-sm text-muted-foreground">
            Chưa có tiện ích nào. Sẽ bổ sung sau.
          </p>
        </TabsContent>
      </UrlTabs>
    </div>
  );
}
