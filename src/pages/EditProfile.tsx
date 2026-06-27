import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { queryKeys, invalidateUserProfile } from "@/lib/query-keys";
import { AppShell } from "@/shared/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  institution: z.string().optional(),
  category: z.string().optional(),
  sub_category: z.string().optional(),
  profession: z.enum([
    "corporate_employee", "self_employed", "student",
    "independent_researcher", "other",
  ]),
});

type FormValues = z.infer<typeof schema>;

interface ApiUser {
  name: string;
  profession: string;
  institution: string | null;
  category: string | null;
  sub_category: string | null;
}

const EditProfile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isPending } = useQuery({
    queryKey: queryKeys.me(),
    queryFn: () => api.get<ApiUser>("/users/me"),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: user
      ? {
          name: user.name,
          profession: user.profession as FormValues["profession"],
          institution: user.institution ?? "",
          category: user.category ?? "",
          sub_category: user.sub_category ?? "",
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => {
      // Convert empty strings to undefined so the backend excludes them
      // from model_dump(exclude_none=True) and avoids overwriting with "".
      const payload: Record<string, unknown> = {
        name: data.name,
        profession: data.profession,
        institution: data.institution || undefined,
        category: data.category || undefined,
        sub_category: data.sub_category || undefined,
      };
      return api.put("/users/me", payload);
    },
    onSuccess: async () => {
      await invalidateUserProfile(queryClient);
      toast({ title: "Profile updated" });
      navigate(ROUTES.profile);
    },
    onError: () => {
      toast({ title: "Failed to update profile", variant: "destructive" });
    },
  });

  if (isPending) {
    return (
      <AppShell withContainer mainClassName="flex min-h-[60vh] items-center justify-center px-4 pb-12 pt-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </AppShell>
    );
  }

  return (
    <AppShell withContainer mainClassName="max-w-2xl px-4 pb-12 pt-24" backgroundClassName="bg-gradient-subtle">
      <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
      <Card className="p-8 border-border/50 bg-card/50 backdrop-blur-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="institution" render={({ field }) => (
              <FormItem>
                <FormLabel>Institution</FormLabel>
                <FormControl><Input placeholder="Your university or company" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl><Input placeholder="e.g. Technology, Economics" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="sub_category" render={({ field }) => (
              <FormItem>
                <FormLabel>Sub-category</FormLabel>
                <FormControl><Input placeholder="e.g. AI, Behavioural Economics" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="profession" render={({ field }) => (
              <FormItem>
                <FormLabel>Profession</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select profession" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="corporate_employee">Corporate Employee</SelectItem>
                    <SelectItem value="self_employed">Self-Employed</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="independent_researcher">Independent Researcher</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(ROUTES.profile)}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </AppShell>
  );
};

export default EditProfile;
