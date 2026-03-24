import * as z from "zod";

export const PROFESSION_OPTIONS = [
  { value: "corporate_employee", label: "Corporate employee" },
  { value: "self_employed", label: "Self-employed" },
  { value: "student", label: "Student" },
  { value: "independent_researcher", label: "Independent researcher" },
  { value: "other", label: "Other" },
] as const;

export const signInSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  profession: z.enum(
    [
      "corporate_employee",
      "self_employed",
      "student",
      "independent_researcher",
      "other",
    ],
    { required_error: "Please select your profession" },
  ),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;
