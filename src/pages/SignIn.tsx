import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
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
import { useAuth } from "@/features/auth/context/AuthContext";
import AuthPageCard from "@/features/auth/components/AuthPageCard";
import GoogleSignInButton from "@/features/auth/components/GoogleSignInButton";
import { AppShell } from "@/shared/components/layout/AppShell";

const SignIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn: storeToken } = useAuth();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormValues) => {
    try {
      const response = await signIn(data);
      storeToken(response.access_token);

      toast({
        title: "Success",
        description: "Signed in successfully!",
      });

      navigate(ROUTES.home);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to sign in. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppShell withContainer mainClassName="min-h-full max-w-md p-4" backgroundClassName="bg-gradient-subtle">
      <AuthPageCard title="Sign In">
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
              className="w-full bg-gradient-primary shadow-elegant transition-all hover:shadow-glow"
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

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            to={ROUTES.signUp}
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </div>

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
