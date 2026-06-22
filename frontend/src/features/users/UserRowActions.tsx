"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import type { User } from "@/features/users/types";

const actionButtonClass =
  "rounded-md px-2 py-1 text-xs font-medium";

interface UserRowActionsProps {
  user: User;
  canTransfer: boolean;
  onStatusClick: (user: User) => void;
  onResetClick: (user: User) => void;
  onTransferClick: (user: User) => void;
}

export function UserRowActions({
  user,
  canTransfer,
  onStatusClick,
  onResetClick,
  onTransferClick,
}: UserRowActionsProps) {
  return (
    <div className="flex flex-nowrap items-center gap-1">
      <Link href={`/admin/users/${user.id}`}>
        <Button variant="outline" className={actionButtonClass}>
          View
        </Button>
      </Link>
      <Link href={`/admin/users/${user.id}/edit`}>
        <Button variant="outline" className={actionButtonClass}>
          Edit
        </Button>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={`${actionButtonClass} inline-flex items-center border border-brand-blue-25 bg-white text-brand-blue transition-colors hover:bg-brand-blue-05 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-1`}
        >
          More
          <span className="sr-only"> actions for {user.fullName}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onStatusClick(user)}>
            {user.isActive ? "Disable" : "Enable"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onResetClick(user)}>
            Reset Password
          </DropdownMenuItem>
          {canTransfer ? (
            <DropdownMenuItem onClick={() => onTransferClick(user)}>
              Transfer Branch
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
