"use client";

import type {
  PreviewPage,
  SiteSettingsFieldsProps
} from "@/components/admin/site-settings-editor-types";
import { InlineText } from "@/components/admin/site-settings-inline-text";
import { cn } from "@/lib/utils";

export function SiteSettingsPreviewHeader({
  formState,
  updateField,
  page,
  onPageChange
}: SiteSettingsFieldsProps & {
  page: PreviewPage;
  onPageChange: (page: PreviewPage) => void;
}) {
  const navigation: Array<{
    label: string;
    page: PreviewPage | null;
    visible: boolean;
  }> = [
    { label: "Home", page: "home", visible: formState.navigationHome },
    { label: "Work", page: "work", visible: formState.navigationWork },
    {
      label: "Services",
      page: "services",
      visible: formState.navigationServices
    },
    { label: "About", page: "about", visible: formState.navigationAbout },
    { label: "Contact", page: "contact", visible: formState.navigationContact }
  ];

  return (
    <header className="border-b border-line bg-[var(--header-bg)] px-5 py-4 backdrop-blur-xl sm:px-7">
      <div className="flex items-center justify-between gap-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-line bg-panel text-xs font-semibold uppercase tracking-ui">
            {formState.brandMark || "L/S"}
          </div>
          <div className="min-w-0">
            <InlineText
              value={formState.brandName}
              placeholder="Brand name"
              ariaLabel="Brand name"
              onChange={(value) => updateField("brandName", value)}
              className="truncate px-1 py-0.5 text-xs uppercase tracking-ui text-muted"
            />
            <InlineText
              value={formState.brandStrapline}
              placeholder="Brand strapline"
              ariaLabel="Brand strapline"
              onChange={(value) => updateField("brandStrapline", value)}
              className="mt-1 hidden truncate px-1 py-0.5 text-[0.68rem] text-muted sm:block"
            />
          </div>
        </div>
        <nav className="flex items-center gap-1 overflow-x-auto">
          {navigation
            .filter((item) => item.visible)
            .map((item, index) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (item.page) onPageChange(item.page);
                }}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-2 text-[0.58rem] uppercase tracking-ui",
                  page === item.page
                    ? "bg-foreground text-background"
                    : "text-muted hover:bg-panel-secondary hover:text-foreground"
                )}
              >
                <span className="font-[family-name:var(--font-mono)] mr-1.5 text-accent">
                  0{index + 1}
                </span>
                {item.label}
              </button>
            ))}
        </nav>
      </div>
    </header>
  );
}
