"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicPortalLayout } from "@/components/layout/PublicPortalLayout";
import { Button } from "@/components/ui/Button";
import { fetchPolicyById } from "@/features/policies/api";
import { PolicyViewer } from "@/features/policies/PolicyViewer";
import type { Policy } from "@/features/policies/types";
import { getApiErrorMessage } from "@/lib/api-client";

export function PublicPolicyViewerContent({ id }: { id: number }) {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPolicy() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchPolicyById(id);
        setPolicy(response);
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load policy. Please try again."));
      } finally {
        setIsLoading(false);
      }
    }

    void loadPolicy();
  }, [id]);

  return (
    <PublicPortalLayout>
      <div className="mx-auto max-w-6xl">
        {policy ? (
          <div className="mb-4 flex justify-end">
            <Link href="/policies">
              <Button variant="outline">Back to List</Button>
            </Link>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-25 border-t-brand-blue" />
          </div>
        ) : error ? (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        ) : policy ? (
          <PolicyViewer documentId={policy.id} title={policy.title} />
        ) : null}
      </div>
    </PublicPortalLayout>
  );
}
