"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  UtensilsCrossed,
  DoorOpen,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Pizza,
  Tag,
  Armchair,
  CalendarCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Menu",
    href: "/dashboard/menu",
    icon: UtensilsCrossed,
    children: [
      {
        title: "Categorie",
        href: "/dashboard/menu/categories",
        icon: Tag,
      },
      {
        title: "Prodotti",
        href: "/dashboard/menu/products",
        icon: Pizza,
      },
    ],
  },
  {
    title: "Sala",
    href: "/dashboard/hall",
    icon: DoorOpen,
    children: [
      {
        title: "Tavoli",
        href: "/dashboard/hall/tables",
        icon: Armchair,
      },
      {
        title: "Prenotazioni",
        href: "/dashboard/hall/reservations",
        icon: CalendarCheck,
      },
    ],
  },
  {
    title: "Ordini",
    href: "/dashboard/orders",
    icon: ShoppingCart,
  },
];

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  const pathname = usePathname();

  const toggleItem = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? "80px" : "280px",
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
        className={cn(
          "relative flex flex-col border-r bg-card h-screen",
          className
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <Pizza className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">Pizzeria</span>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className=""
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems.includes(item.href);
              const active = isActive(item.href);

              return (
                <div key={item.href}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={item.href}>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              "flex items-center justify-center h-10 w-full rounded-md transition-colors",
                              active
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                          </motion.div>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.title}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <>
                      <motion.div
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        {hasChildren ? (
                          <button
                            onClick={() => toggleItem(item.href)}
                            className={cn(
                              "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
                              active
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                            <span className="flex-1 text-left">
                              {item.title}
                            </span>
                            <motion.div
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </motion.div>
                          </button>
                        ) : (
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                              active
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                            {item.badge !== undefined && (
                              <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        )}
                      </motion.div>

                      {/* Sub-items */}
                      <AnimatePresence>
                        {hasChildren && isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="ml-8 mt-1 space-y-1">
                              {item.children?.map((child) => {
                                const childActive = pathname === child.href;
                                return (
                                  <motion.div
                                    key={child.href}
                                    whileHover={{ x: 4 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <Link
                                      href={child.href}
                                      className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                                        childActive
                                          ? "bg-primary/10 text-primary font-medium"
                                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                      )}
                                    >
                                      <child.icon className="h-4 w-4" />
                                      <span>{child.title}</span>
                                    </Link>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4">
          <Separator className="mb-4" />
          <div
            className={cn(
              "flex items-center",
              collapsed ? "justify-center" : "justify-between"
            )}
          >
            <ThemeToggle />
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs text-muted-foreground"
                >
                  v1.0.0
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
