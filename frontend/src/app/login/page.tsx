import { AdminBrand } from "@/components/layout/AdminBrand";
import { LoginForm } from "@/features/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-brand-blue-05">
      <div className="border-b-4 border-brand-green bg-brand-blue">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <p className="text-xs font-medium tracking-wide text-brand-blue-25 sm:text-sm">
            Secure Staff Access
          </p>
          <p className="text-xs font-medium tracking-wide text-brand-blue-25 sm:text-sm">
            skdbl.com.np
          </p>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-52px)] flex-col lg:flex-row">
        <section className="relative hidden flex-1 flex-col justify-center bg-brand-blue px-6 py-12 text-white lg:flex lg:px-12 lg:py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            aria-hidden="true"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 80%, #74b53c 0%, transparent 50%), radial-gradient(circle at 80% 20%, #fff012 0%, transparent 40%)",
            }}
          />

          <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
            <div className="mb-10">
              <AdminBrand
                variant="light"
                size="lg"
                showTagline
                tagline="Trusted Banking Partner"
              />
            </div>

            <div className="space-y-4 border-t border-white/20 pt-8">
              <p className="text-lg font-medium leading-relaxed text-brand-blue-25">
                Authorized personnel access for internal banking operations.
              </p>
              <p className="text-sm text-brand-blue-50">
                Our Community, Our Bank
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-12">
          <div className="mb-10 w-full max-w-md rounded-2xl border border-brand-blue-15 bg-white px-5 py-6 shadow-sm lg:hidden">
            <AdminBrand
              size="md"
              showTagline
              tagline="Trusted Banking Partner"
            />
          </div>

          <div className="w-full max-w-md">
            <div className="mb-6 hidden lg:block">
              <h2 className="text-xl font-bold text-brand-blue">Sign in</h2>
              <p className="mt-1 text-sm text-brand-black-75">
                Enter your staff credentials to continue
              </p>
            </div>

            <LoginForm />

            <p className="mt-8 text-center text-xs leading-relaxed text-brand-black-50">
              This portal is restricted to authorized Saptakoshi Development
              Bank staff. Unauthorized access is prohibited.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
