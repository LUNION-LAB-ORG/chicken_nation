import { AppSidebar } from "@/components/(protected)/dashboard/common/app-sidebar";
import { SiteHeader } from "@/components/(protected)/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import Main from "@/components/primitives/Main";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <Main>{children}</Main>
      </SidebarInset>
    </SidebarProvider>
  );
}
