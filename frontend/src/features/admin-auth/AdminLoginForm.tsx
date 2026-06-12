"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError, apiClient } from "@/lib/api-client";
import { isAuthenticated, saveToken, saveUser } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import {
  adminLoginSchema,
  type AdminLoginFormValues,
} from "@/features/admin-auth/login-schema";
import type { AdminLoginResponse } from "@/features/admin-auth/types";

export function AdminLoginForm() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/admin/dashboard");
    }
  }, [router]);

  async function onSubmit(values: AdminLoginFormValues) {
    setApiError(null);

    try {
      const result = await apiClient<AdminLoginResponse>(
        "/api/admin/auth/login",
        {
          method: "POST",
          body: values,
        }
      );

      saveToken(result.token);
      saveUser(result.user);
      router.push("/admin/dashboard");
    } catch (error) {
      if (error instanceof ApiError) {
        setApiError(error.message);
        return;
      }

      setApiError("Unable to connect to the server. Please try again.");
    }
  }

  return (
    <Card className="w-full max-w-md overflow-hidden">
      <div className="border-b border-brand-blue-15 bg-brand-blue-05 px-8 py-4 lg:hidden">
        <h2 className="text-lg font-bold text-brand-blue">Sign in</h2>
        <p className="mt-0.5 text-sm text-brand-black-75">
          Enter your staff credentials
        </p>
      </div>
      <CardContent className="px-8 py-8">
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          {apiError ? (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {apiError}
            </div>
          ) : null}

          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="admin@saptakoshi.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register("password")}
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
          >
            Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
