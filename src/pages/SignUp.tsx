import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  PROFESSION_OPTIONS,
  signUpSchema,
  type SignUpFormValues,
} from "@/features/auth/domain/schemas";
import { signUp } from "@/features/auth/services/auth-service";
import { ApiError, RATE_LIMITED } from "@/lib/api";
import { useAuth } from "@/features/auth/context/AuthContext";
import { redirectAfterAuth } from "@/features/auth/lib/post-auth-redirect";
import AuthPageCard from "@/features/auth/components/AuthPageCard";
import GoogleSignInButton from "@/features/auth/components/GoogleSignInButton";
import { AppShell } from "@/shared/components/layout/AppShell";

const SignUp = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { signIn: markAuthenticated } = useAuth();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      profession: undefined,
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      await signUp(data);
      markAuthenticated();

      toast({
        title: "Account created",
        description: "Check your inbox to verify your email and continue.",
      });

      await redirectAfterAuth(navigate, queryClient);
    } catch (error) {
      const isRateLimited = error instanceof ApiError && error.message === RATE_LIMITED;
      let description = "Failed to create account. Please try again.";
      if (isRateLimited) {
        description = "Too many sign-up attempts. Please wait a moment and try again.";
      } else if (error instanceof Error) {
        description = error.message;
      }
      toast({ title: isRateLimited ? "Too many attempts" : "Error", description, variant: "destructive" });
    }
  };

  return (
    <AppShell mainClassName="auth-page-main" showFooter={false}>
      <AuthPageCard mode="signup">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="signup-form">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your full name"
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
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Choose a username"
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
                      placeholder="At least 8 characters"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
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

            <FormField
              control={form.control}
              name="profession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profession</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={form.formState.isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your profession" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROFESSION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  Creating account...
                </>
              ) : (
                "Sign Up"
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
          <GoogleSignInButton label="Sign up with Google" />
        </div>
      </AuthPageCard>
    </AppShell>
  );
};

export default SignUp;
