"use client";

import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavigationMenu({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root>) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      className={cn("relative z-20 flex max-w-max items-center justify-center", className)}
      {...props}
    >
      {children}
    </NavigationMenuPrimitive.Root>
  );
}

export function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn("group flex flex-1 list-none items-center justify-center gap-2", className)}
      {...props}
    />
  );
}

export function NavigationMenuItem(
  props: React.ComponentProps<typeof NavigationMenuPrimitive.Item>
) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className="relative"
      {...props}
    />
  );
}

const triggerBaseClass =
  "group inline-flex h-12 items-center gap-2 rounded-2xl px-4 text-sm font-medium transition-all duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-blue disabled:pointer-events-none disabled:opacity-50";

export function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(
        triggerBaseClass,
        "bg-white/8 text-white hover:bg-white/14 data-[state=open]:bg-white/14",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

export function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "left-0 top-full mt-3 w-full origin-top rounded-3xl border border-brand-black-15 bg-white/96 text-brand-black shadow-2xl shadow-brand-black/15 backdrop-blur-xl transition-[opacity,transform] duration-200 ease-out data-[motion=from-end]:animate-in data-[motion=from-end]:fade-in data-[motion=from-start]:animate-in data-[motion=from-start]:fade-in data-[motion=to-end]:animate-out data-[motion=to-end]:fade-out data-[motion=to-start]:animate-out data-[motion=to-start]:fade-out data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100 md:absolute md:w-auto",
        className
      )}
      {...props}
    />
  );
}

export function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn("outline-none", className)}
      {...props}
    />
  );
}
