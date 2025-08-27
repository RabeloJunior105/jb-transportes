"use client"

import type * as React from "react"
import {
  Truck,
  LayoutDashboard,
  FileText,
  Users,
  DollarSign,
  Fuel,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  User2,
} from "lucide-react"

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
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Link from "next/link"

const data = {
  user: {
    name: "Admin JB",
    email: "admin@jbtransportes.com.br",
    avatar: "/admin-avatar.png",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Serviços",
      url: "/dashboard/services",
      icon: FileText,
    },
    {
      title: "Frota",
      icon: Truck,
      items: [
        {
          title: "Veículos",
          url: "/dashboard/fleet/vehicles",
        },
        {
          title: "Manutenção",
          url: "/dashboard/fleet/maintenance",
        },
      ],
    },
    {
      title: "Financeiro",
      icon: DollarSign,
      items: [
        {
          title: "Contas a Pagar",
          url: "/dashboard/finance/payable",
        },
        {
          title: "Contas a Receber",
          url: "/dashboard/finance/receivable",
        },
      ],
    },
    {
      title: "RH",
      url: "/dashboard/people/employees",
      icon: Users,
    },
    {
      title: "Associados",
      icon: Building2,
      items: [
        {
          title: "Clientes",
          url: "/dashboard/clients",
        },
        {
          title: "Fornecedores",
          url: "/dashboard/suppliers",
        },
      ],
    },
    {
      title: "Combustivel",
      url: "/dashboard/fuel",
      icon: Fuel,
    },
  ],
  navSecondary: [
    {
      title: "Perfil",
      url: "/dashboard/profile",
      icon: User2,
    },
    {
      title: "Relatórios",
      url: "/dashboard/reports",
      icon: BarChart3,
    },
    {
      title: "Configurações",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="border-b border-sidebar-border bg-sidebar-primary">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar-accent/10">
              <Link href="/dashboard">
                <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <Truck className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-sidebar-foreground text-base">JB Transportes</span>
                  <span className="truncate text-xs text-sidebar-muted-foreground font-medium">Sistema de Gestão</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-muted-foreground px-3 py-2 mb-2 uppercase tracking-wider">
            Módulos Principais
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {data.navMain.map((item) => (
                <Collapsible key={item.title} asChild defaultOpen={false} className="group/collapsible">
                  <SidebarMenuItem>
                    {item.items ? (
                      <>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            className="w-full justify-between hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg px-3 py-2.5 transition-all duration-200 group-hover:shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              {item.icon && (
                                <item.icon className="size-4 text-sidebar-muted-foreground group-hover:text-sidebar-accent-foreground" />
                              )}
                              <span className="font-medium text-sm">{item.title}</span>
                            </div>
                            <ChevronDown className="size-4 text-sidebar-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="ml-6 mt-2 space-y-1 border-l border-sidebar-border pl-3">
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md px-3 py-2 transition-all duration-200"
                                >
                                  <Link href={subItem.url}>
                                    <span className="text-sm font-medium">{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        className="w-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg px-3 py-2.5 transition-all duration-200 group-hover:shadow-sm"
                      >
                        <Link href={item.url!}>
                          <div className="flex items-center gap-3">
                            {item.icon && (
                              <item.icon className="size-4 text-sidebar-muted-foreground group-hover:text-sidebar-accent-foreground" />
                            )}
                            <span className="font-medium text-sm">{item.title}</span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {data.navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg px-3 py-2.5 transition-all duration-200"
                  >
                    <Link href={item.url}>
                      <item.icon className="size-4 text-sidebar-muted-foreground group-hover:text-sidebar-accent-foreground" />
                      <span className="font-medium text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3 bg-sidebar-primary/5">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent rounded-lg transition-all duration-200"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <User2 className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-sidebar-foreground">{data.user.name}</span>
                    <span className="truncate text-xs text-sidebar-muted-foreground">{data.user.email}</span>
                  </div>
                  <ChevronDown className="ml-auto size-4 text-sidebar-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 min-w-56 rounded-lg" side="bottom" align="end" sideOffset={4}>
                <DropdownMenuItem asChild className="hover:bg-accent cursor-pointer">
                  <Link href="/dashboard/profile">
                    <User2 className="size-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-accent cursor-pointer">
                  <Link href="/dashboard/settings">
                    <Settings className="size-4" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-accent text-destructive cursor-pointer">
                  <LogOut className="size-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
