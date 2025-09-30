"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Truck,
  LayoutDashboard,
  FileText,
  Users,
  DollarSign,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  User2,
  // Fuel, // se quiser usar depois, mantém aqui
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { useSupabaseUser } from "@/hooks/useSupabaseUser";

// ====================== NAV DATA ======================
const data = {
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Serviços", url: "/dashboard/services", icon: FileText },
    { title: "RH", url: "/dashboard/people/employees", icon: Users },
    {
      title: "Financeiro",
      icon: DollarSign,
      items: [
        { title: "Orçamentos", url: "/dashboard/finance/budgets" },
        { title: "Contas a Pagar", url: "/dashboard/finance/payable" },
        { title: "Contas a Receber", url: "/dashboard/finance/receivable" },
      ],
    },
    {
      title: "Frota",
      icon: Truck,
      items: [
        { title: "Veículos", url: "/dashboard/fleet/vehicles" },
        { title: "Manutenção", url: "/dashboard/fleet/maintenance" },
        { title: "Combustível", url: "/dashboard/fleet/fuel" },
      ],
    },
    {
      title: "Associados",
      icon: Building2,
      items: [
        { title: "Clientes", url: "/dashboard/clients" },
        { title: "Fornecedores", url: "/dashboard/suppliers" },
      ],
    },
  ],
  navSecondary: [
    /*  { title: "Perfil", url: "/dashboard/profile", icon: User2 },
     { title: "Relatórios", url: "/dashboard/reports", icon: BarChart3 },
     { title: "Configurações", url: "/dashboard/settings", icon: Settings }, */
  ],
} as const;

const UUID_RE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
const NUM_RE = /^\d+$/;

function lastStableSegment(pathname: string) {
  const segs = pathname.split("/").filter(Boolean);
  if (segs[0] === "dashboard") segs.shift(); // ignora base

  for (let i = segs.length - 1; i >= 0; i--) {
    const s = segs[i];
    if (!UUID_RE.test(s) && !NUM_RE.test(s)) {
      return s;
    }
  }
  return segs[segs.length - 1] ?? "";
}

// Pega o último segmento da URL do item do menu
function itemKeyFromUrl(url?: string) {
  if (!url) return "";
  const segs = url.split("/").filter(Boolean);
  return segs[segs.length - 1] ?? "";
}

function isItemActive(pathname: string, itemUrl?: string) {
  const currentKey = lastStableSegment(pathname);
  const itemKey = itemKeyFromUrl(itemUrl);
  return !!itemUrl && currentKey === itemKey;
}

function groupHasActive(pathname: string, item: any) {
  if (item?.url) return isItemActive(pathname, item.url);
  if (item?.items) return item.items.some((i: any) => isItemActive(pathname, i.url));
  return false;
}

// ====================== COMPONENTE ======================
export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, supabase } = useSupabaseUser();

  const displayName = user?.name ?? user?.email ?? "Usuário";
  const displayEmail = user?.email ?? "—";
  // const avatar = user?.avatar_url ?? "/admin-avatar.png"; // se quiser exibir imagem

  const onSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <Sidebar variant="inset" {...props}>
      {/* HEADER */}
      <SidebarHeader className="border-b border-sidebar-border bg-sidebar-primary">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar-accent/10">
              <Link href="/dashboard" prefetch>
                <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <Truck className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-sidebar-foreground text-base">
                    JB Transportes
                  </span>
                  <span className="truncate text-xs text-sidebar-muted-foreground font-medium">
                    Sistema de Gestão
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* NAV */}
      <SidebarContent className="px-3 py-4">
        {/* PRINCIPAIS */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-muted-foreground px-3 py-2 mb-2 uppercase tracking-wider">
            Módulos Principais
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {data.navMain.map((item) => {
                const open = groupHasActive(pathname, item);

                return (
                  <Collapsible key={item.title} asChild defaultOpen={open} className="group/collapsible">
                    <SidebarMenuItem>
                      {"items" in item && item.items ? (
                        <>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              tooltip={item.title}
                              className={`w-full justify-between rounded-lg px-3 py-2.5 transition-all duration-200 group-hover:shadow-sm
                                hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                                ${open ? "bg-sidebar-accent/10" : ""}`}
                            >
                              <div className="flex items-center gap-3">
                                {item.icon && (
                                  <item.icon className="size-4 text-sidebar-muted-foreground group-hover:text-sidebar-accent-foreground" />
                                )}
                                <span className="font-medium text-sm">{item.title}</span>
                              </div>
                              <ChevronDown
                                className={`size-4 text-sidebar-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""
                                  }`}
                              />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <SidebarMenuSub className="ml-6 mt-2 space-y-1 border-l border-sidebar-border pl-3">
                              {item.items.map((sub) => {
                                const active = isItemActive(pathname, sub.url);
                                return (
                                  <SidebarMenuSubItem key={sub.title}>
                                    <SidebarMenuSubButton
                                      asChild
                                      className={`rounded-md px-3 py-2 transition-all duration-200
                                        hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                                        ${active ? "bg-sidebar-accent/15" : ""}`}
                                    >
                                      <Link href={sub.url} prefetch>
                                        <span className="text-sm font-medium">{sub.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              })}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </>
                      ) : (
                        (() => {
                          const activeTop = isItemActive(pathname, (item as any).url);
                          return (
                            <SidebarMenuButton
                              asChild
                              tooltip={(item as any).title}
                              className={`w-full rounded-lg px-3 py-2.5 transition-all duration-200 group-hover:shadow-sm
                                hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                                ${activeTop ? "bg-sidebar-accent/15" : ""}`}
                            >
                              <Link href={(item as any).url!} prefetch>
                                <div className="flex items-center gap-3">
                                  {(item as any).icon && (() => {
                                    const Icon = (item as any).icon;
                                    return <Icon className="size-4 text-sidebar-muted-foreground group-hover:text-sidebar-accent-foreground" />;
                                  })()}
                                  <span className="font-medium text-sm">{(item as any).title}</span>
                                </div>
                              </Link>
                            </SidebarMenuButton>
                          );
                        })()
                      )}
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* SECUNDÁRIOS */}
        <SidebarGroup className="mt-8">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {data.navSecondary.map((item: any) => {
                const active = isItemActive(pathname, item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={`rounded-lg px-3 py-2.5 transition-all duration-200
                        hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                        ${active ? "bg-sidebar-accent/15" : ""}`}
                    >
                      <Link href={item.url} prefetch>
                        <item.icon className="size-4 text-sidebar-muted-foreground group-hover:text-sidebar-accent-foreground" />
                        <span className="font-medium text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER / USER */}
      <SidebarFooter className="border-t border-sidebar-border p-3 bg-sidebar-primary/5">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent rounded-lg transition-all duration-200"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 text-primary overflow-hidden">
                    {/* Se quiser usar <Image> com avatar real, troca aqui */}
                    <User2 className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-sidebar-foreground">
                      {displayName}
                    </span>
                    <span className="truncate text-xs text-sidebar-muted-foreground">
                      {displayEmail}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto size-4 text-sidebar-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56 min-w-56 rounded-lg" side="bottom" align="end" sideOffset={4}>
                <DropdownMenuItem asChild className="hover:bg-accent cursor-pointer">
                  <Link href="/dashboard/profile" prefetch>
                    <User2 className="size-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                {/*                 <DropdownMenuItem asChild className="hover:bg-accent cursor-pointer">
                  <Link href="/dashboard/settings" prefetch>
                    <Settings className="size-4" />
                    Configurações
                  </Link>
                </DropdownMenuItem> */}
                <DropdownMenuItem
                  className="hover:bg-accent text-destructive cursor-pointer"
                  onClick={onSignOut}
                >
                  <LogOut className="size-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
