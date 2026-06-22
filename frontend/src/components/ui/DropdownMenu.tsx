"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  menuId: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext() {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error("DropdownMenu components must be used within DropdownMenu");
  }
  return context;
}

interface DropdownMenuProps {
  children: ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        close();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, close]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, menuId, triggerRef }}>
      <div ref={containerRef} className="relative inline-block">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

interface DropdownMenuTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function DropdownMenuTrigger({
  children,
  className = "",
  onClick,
  ...props
}: DropdownMenuTriggerProps) {
  const { open, setOpen, menuId, triggerRef } = useDropdownMenuContext();

  return (
    <button
      ref={triggerRef}
      type="button"
      className={className}
      aria-expanded={open}
      aria-haspopup="menu"
      aria-controls={menuId}
      onClick={(event) => {
        setOpen(!open);
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  align?: "start" | "end";
}

export function DropdownMenuContent({
  children,
  className = "",
  align = "end",
  ...props
}: DropdownMenuContentProps) {
  const { open, menuId } = useDropdownMenuContext();

  if (!open) return null;

  const alignClass = align === "end" ? "right-0" : "left-0";

  return (
    <div
      id={menuId}
      role="menu"
      className={`absolute z-20 mt-1 min-w-[10rem] rounded-lg border border-brand-black-15 bg-white py-1 shadow-lg ${alignClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface DropdownMenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function DropdownMenuItem({
  children,
  className = "",
  onClick,
  ...props
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenuContext();

  return (
    <button
      type="button"
      role="menuitem"
      className={`flex w-full items-center px-3 py-1.5 text-left text-xs text-brand-black transition-colors hover:bg-brand-blue-05 focus-visible:bg-brand-blue-05 focus-visible:outline-none ${className}`}
      onClick={(event) => {
        setOpen(false);
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
