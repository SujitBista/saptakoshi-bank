import Link from "next/link";
import { APP_NAME } from "@saptakoshi/shared";
import { PublicPortalLayout } from "@/components/layout/PublicPortalLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export default function Home() {
  return (
    <PublicPortalLayout>
      <div className="mx-auto max-w-5xl">
        <Card>
          <CardHeader
            title={APP_NAME}
            description="Public product paper portal for Saptakoshi Development Bank"
          />
          <CardContent className="space-y-6">
            <p className="text-sm leading-6 text-brand-black-75">
              Browse public product paper PDFs by category. Documents open inside the
              application with inline viewing and best-effort download deterrents.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-brand-black-15 bg-brand-blue-05 p-5">
                <h2 className="text-lg font-semibold text-brand-blue">Deposit</h2>
                <p className="mt-2 text-sm text-brand-black-75">
                  View deposit-related product paper documents.
                </p>
                <div className="mt-4">
                  <Link href="/product-paper/deposit">
                    <Button>Open Deposit Product Papers</Button>
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-brand-black-15 bg-brand-blue-05 p-5">
                <h2 className="text-lg font-semibold text-brand-blue">Credit</h2>
                <p className="mt-2 text-sm text-brand-black-75">
                  View credit-related product paper documents.
                </p>
                <div className="mt-4">
                  <Link href="/product-paper/credit">
                    <Button>Open Credit Product Papers</Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicPortalLayout>
  );
}
