import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { AppShell } from "@/shared/components/layout/AppShell";
import AuthPageCard from "@/features/auth/components/AuthPageCard";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type Values = z.infer<typeof schema>;

const ForgotPassword = () => {
  const { toast } = useToast();
  const [sent, setSent] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: Values) => {
    try {
      await api.post("/auth/forgot-password", { email: data.email });
      setSent(true);
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (sent) {
    return (
      <AppShell showFooter={false}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
          <h1 className="text-2xl font-semibold">Check your email</h1>
          <p className="text-muted-foreground max-w-sm">
            If an account with that email exists, we've sent a password reset link. It expires in 1 hour.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell mainClassName="auth-page-main" showFooter={false}>
      <AuthPageCard mode="signin">
        <h2 className="text-xl font-semibold mb-4">Reset your password</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        </Form>
      </AuthPageCard>
    </AppShell>
  );
};

export default ForgotPassword;
