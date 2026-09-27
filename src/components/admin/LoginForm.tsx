"use client";

import { useActionState } from "react";

import { signIn, type SignInState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, { error: null });

  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <Input id="email" name="email" type="email" autoComplete="email" required className="h-10 bg-white" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Password
        </label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required className="h-10 bg-white" />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" size="xl" disabled={pending} className="w-full bg-navy text-white hover:bg-navy/90">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
