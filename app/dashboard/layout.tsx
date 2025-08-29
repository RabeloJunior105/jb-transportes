"use client"

import React from "react"
import { usePathname } from "next/navigation"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import { Toaster } from 'sonner';

// Função simples para capitalizar as palavras
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() // /dashboard/people/employees
  const segments = pathname?.split("/").filter(Boolean) || [] // ['dashboard','people','employees']

  // Construir o caminho incremental para cada segmento
  let pathAccumulator = ""

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              {segments.map((segment, idx) => {
                pathAccumulator += `/${segment}`
                const isLast = idx === segments.length - 1
                return (
                  <React.Fragment key={pathAccumulator}>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{capitalize(segment)}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={pathAccumulator}>{capitalize(segment)}</BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <Toaster />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
