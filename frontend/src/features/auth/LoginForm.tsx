"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LoginResponse } from "@saptakoshi/shared";
import { USER_ROLES } from "@saptakoshi/shared";
import { ApiError, apiClient } from "@/lib/api-client";
import {
  getDashboardPathForRole,
  getUser,
  isAuthenticated,
  saveToken,
  saveUser,
} from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/login-schema";

type LoginFormProps = {
  redirectPath?: string;
};

export function LoginForm({ redirectPath }: LoginFormProps) {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!isAuthenticated()) return;

    const storedUser = getUser();
    if (!storedUser) return;

    router.replace(redirectPath ?? getDashboardPathForRole(storedUser.role));
  }, [redirectPath, router]);

  async function onSubmit(values: LoginFormValues) {
    setApiError(null);

    try {
      const result = await apiClient<LoginResponse>("/api/admin/auth/login", {
        method: "POST",
        body: values,
      });

      saveToken(result.token);
      saveUser(result.user);

      const destination =
        redirectPath ?? getDashboardPathForRole(result.user.role);

      if (
        redirectPath?.startsWith("/admin") &&
        result.user.role !== USER_ROLES.ADMIN
      ) {
        router.replace("/dashboard");
        return;
      }

      router.push(destination);
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
            placeholder="you@saptakoshi.com"
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

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
