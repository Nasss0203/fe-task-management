import { AppSidebarUser } from "@/components/sidebar/user/app-sidebar-user";
import { ToggleMode } from "@/components/toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/popover/NotificationBell";
import React from "react";
import { Monitor } from "lucide-react";

// Force rebuild for AI Assistant sidebar item
const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <div className="flex md:hidden h-svh w-svw flex-col items-center justify-center p-6 text-center bg-background">
        <div className="rounded-full bg-secondary p-4 mb-4">
          <Monitor className="size-10 text-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Trải nghiệm trên máy tính</h2>
        <p className="mt-3 text-[14px] text-muted-foreground font-medium max-w-sm">
          Bảng điều khiển được thiết kế tối ưu cho không gian làm việc rộng. Vui lòng sử dụng máy tính để có trải nghiệm tốt nhất.
        </p>
      </div>

      <div className="hidden md:block h-svh w-full overflow-hidden">
        <SidebarProvider className="h-full overflow-hidden">
          <AppSidebarUser />
          <SidebarInset className="h-full min-h-0 min-w-0 w-full max-w-full overflow-hidden bg-background">
            <header className="flex w-full h-14 shrink-0 items-center gap-2 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sticky top-0 z-10">
              <div className="flex items-center justify-between flex-1">
                <div className="flex items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                  />
                  <Breadcrumb className="hidden">
                    <BreadcrumbList>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="#">Task management</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbPage>Bảng điều khiển</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
                <div className="flex items-center gap-2 px-4">
                  <NotificationBell />
                  <ToggleMode></ToggleMode>
                </div>
              </div>
            </header>
            <div className="flex min-h-0 min-w-0 max-w-full flex-1 flex-col gap-4 overflow-x-visible overflow-y-auto px-4 pt-3 md:px-6 xl:px-10">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </>
  );
};

export default layout;
