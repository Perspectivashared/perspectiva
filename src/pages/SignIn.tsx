import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
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
import { Loader2 } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import {
  signInSchema,
  type SignInFormValues,
} from "@/features/auth/domain/schemas";
import { signIn } from "@/features/auth/services/auth-service";
import { ApiError, RATE_LIMITED } from "@/lib/api";
import { useAuth } from "@/features/auth/context/AuthContext";
import AuthPageCard from "@/features/auth/components/AuthPageCard";
import GoogleSignInButton from "@/features/auth/components/GoogleSignInButton";
import { AppShell } from "@/shared/components/layout/AppShell";

const SignIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn: markAuthenticated } = useAuth();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormValues) => {
    try {
      await signIn(data);
      markAuthenticated();

      toast({
        title: "Success",
        description: "Signed in successfully!",
      });

      navigate(ROUTES.forYou);
    } catch (error) {
      const isRateLimited = error instanceof ApiError && error.message === RATE_LIMITED;
      let description = "Failed to sign in. Please try again.";
      if (isRateLimited) {
        description = "Too many sign-in attempts. Please wait a moment and try again.";
      } else if (error instanceof Error) {
        description = error.message;
      }
      toast({ title: isRateLimited ? "Too many attempts" : "Error", description, variant: "destructive" });
    }
  };

  return (
    <AppShell mainClassName="auth-page-main" showFooter={false}>
      <AuthPageCard mode="signin">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your username"
                      {...field}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6">
          <div className="relative flex items-center gap-3 mb-4">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 border-t border-border" />
          </div>
          <GoogleSignInButton />
        </div>
      </AuthPageCard>
    </AppShell>
  );
};

export default SignIn;
