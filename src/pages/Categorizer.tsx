import React from "react";
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
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  categorizerSchema,
  createDefaultCategorizerValues,
  communityEngagementMotivationEnum,
  engagementFeatureEnum,
  interestEnum,
  loyaltyFactorEnum,
  paymentFactorEnum,
  platformEnum,
  productDiscoveryChannelEnum,
  surveyCompletionMotivatorEnum,
  surveyTurnOffEnum,
  topicOfInterestEnum,
  type CategorizerFormValues,
} from "@/features/categorizer/domain/schema";
import { AppShell } from "@/shared/components/layout/AppShell";
import { queryKeys } from "@/lib/query-keys";
import { redirectAfterAuth } from "@/features/auth/lib/post-auth-redirect";
import { submitCategorizerProfile } from "@/features/categorizer/services/categorizer-repository";

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: "welcome",
    label: "Welcome",
    title: "Welcome to Perspectiva",
    subtitle: "Before we begin, please read and accept our data collection policy.",
  },
  {
    id: "basic",
    label: "Basic Info",
    title: "Basic Information",
    subtitle: "Let's start with some fundamental details about you.",
  },
  {
    id: "demographics",
    label: "Demographics",
    title: "Demographics",
    subtitle: "A few more details that help us personalise your experience.",
  },
  {
    id: "profession",
    label: "Profession",
    title: "Your Profession",
    subtitle: "Tell us what you do — this helps us understand your professional context.",
  },
  {
    id: "income",
    label: "Income",
    title: "Income & Allowance",
    subtitle: "Understanding your financial context helps us match you with relevant surveys.",
  },
  {
    id: "spending",
    label: "Spending",
    title: "Spending Habits",
    subtitle: "How you spend tells us a lot about what matters to you.",
  },
  {
    id: "digital",
    label: "Digital Life",
    title: "Your Digital Life",
    subtitle: "How you use technology shapes the content and communities we suggest.",
  },
  {
    id: "payments",
    label: "Payments",
    title: "Payment Behaviour",
    subtitle: "Understanding your payment preferences helps us tailor premium features.",
  },
  {
    id: "interests",
    label: "Interests",
    title: "Interests & Personality",
    subtitle: "What are you passionate about? This matches you to the right surveys and communities.",
  },
  {
    id: "community",
    label: "Community",
    title: "Community Behaviour",
    subtitle: "How do you like to connect and engage with others online?",
  },
  {
    id: "surveys",
    label: "Surveys",
    title: "Survey Participation",
    subtitle: "Help us understand your survey habits so we can make the experience better for you.",
  },
  {
    id: "technology",
    label: "Technology",
    title: "Technology & Devices",
    subtitle: "How tech-savvy are you and what devices do you rely on?",
  },
  {
    id: "values",
    label: "Values",
    title: "Values & Decisions",
    subtitle: "What drives your decisions? This shapes the kind of insights we ask for.",
  },
  {
    id: "goals",
    label: "Goals",
    title: "Goals & Motivations",
    subtitle: "Why are you here? Help us build the best experience for you.",
  },
  {
    id: "feedback",
    label: "Feedback",
    title: "Feedback Preferences",
    subtitle: "Last step! How would you prefer to share feedback with brands and researchers?",
  },
] as const;

// ─── Primitive option components ──────────────────────────────────────────────

const SelectOption = ({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    onClick={onSelect}
    className={cn(
      "w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
      selected
        ? "border-primary bg-primary/10 text-primary"
        : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5"
    )}
  >
    {label}
  </button>
);

const CheckOption = ({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    className={cn(
      "w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-150 flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
      selected
        ? "border-primary bg-primary/10 text-primary"
        : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5"
    )}
  >
    <div
      className={cn(
        "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
        selected ? "border-primary bg-primary" : "border-muted-foreground/40"
      )}
    >
      {selected && <Check className="w-2.5 h-2.5 text-white" />}
    </div>
    {label}
  </button>
);

// ─── Reusable field wrappers ───────────────────────────────────────────────────

type FieldControl = ReturnType<typeof useForm<CategorizerFormValues>>["control"];

const Question = ({
  label,
  description,
  children,
  error,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  error?: React.ReactNode;
}) => (
  <div className="space-y-3">
    <div>
      <p className="text-sm font-semibold text-foreground">{label}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      )}
    </div>
    {children}
    {error}
  </div>
);

const colsClass = (cols: 1 | 2 | 3) => {
  if (cols === 3) return "grid-cols-3";
  if (cols === 2) return "grid-cols-2";
  return "grid-cols-1";
};

const SingleSelect = ({
  control,
  name,
  label,
  description,
  options,
  cols = 1,
}: {
  control: FieldControl;
  name: keyof CategorizerFormValues;
  label: string;
  description?: string;
  options: readonly string[];
  cols?: 1 | 2 | 3;
}) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <Question label={label} description={description} error={<FormMessage />}>
          <div className={cn("grid gap-2.5", colsClass(cols))}>
            {options.map((opt) => (
              <SelectOption
                key={opt}
                label={opt}
                selected={field.value === opt}
                onSelect={() => field.onChange(opt)}
              />
            ))}
          </div>
        </Question>
      </FormItem>
    )}
  />
);

const MultiSelect = ({
  control,
  name,
  label,
  description,
  options,
  cols = 2,
}: {
  control: FieldControl;
  name: keyof CategorizerFormValues;
  label: string;
  description?: string;
  options: readonly string[];
  cols?: 1 | 2;
}) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => {
      const value: string[] = (field.value as string[]) || [];
      const toggle = (opt: string) => {
        field.onChange(
          value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]
        );
      };
      return (
        <FormItem>
          <Question label={label} description={description} error={<FormMessage />}>
            <div className={cn("grid gap-2.5", cols === 2 ? "grid-cols-2" : "grid-cols-1")}>
              {options.map((opt) => (
                <CheckOption
                  key={opt}
                  label={opt}
                  selected={value.includes(opt)}
                  onToggle={() => toggle(opt)}
                />
              ))}
            </div>
          </Question>
        </FormItem>
      );
    }}
  />
);

const TextField = ({
  control,
  name,
  label,
  placeholder,
  description,
}: {
  control: FieldControl;
  name: keyof CategorizerFormValues;
  label: string;
  placeholder?: string;
  description?: string;
}) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel className="text-sm font-semibold">{label}</FormLabel>
        {description && (
          <p className="text-xs text-muted-foreground -mt-1">{description}</p>
        )}
        <FormControl>
          <Input
            placeholder={placeholder}
            {...field}
            value={field.value as string}
            className="h-11"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

const NumberField = ({
  control,
  name,
  label,
  placeholder,
  optional,
}: {
  control: FieldControl;
  name: keyof CategorizerFormValues;
  label: string;
  placeholder?: string;
  optional?: boolean;
}) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel className="text-sm font-semibold">
          {label}{" "}
          {optional && (
            <span className="text-muted-foreground font-normal text-xs">
              — optional
            </span>
          )}
        </FormLabel>
        <FormControl>
          <Input
            type="number"
            placeholder={placeholder ?? "0"}
            {...field}
            value={optional ? ((field.value as number | undefined) ?? "") : (field.value as number)}
            onChange={(e) => {
              if (optional) {
                field.onChange(e.target.value ? Number(e.target.value) : undefined);
              } else {
                field.onChange(Number(e.target.value));
              }
            }}
            className="h-11"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

// ─── Sidebar helpers ──────────────────────────────────────────────────────────

const stepItemCls = (isActive: boolean, isCompleted: boolean) => {
  if (isActive) return "bg-primary/10 text-primary font-medium";
  if (isCompleted) return "text-foreground hover:bg-muted cursor-pointer";
  return "text-muted-foreground/40 cursor-default";
};

const stepCircleCls = (isActive: boolean, isCompleted: boolean) => {
  if (isActive) return "border-primary bg-primary text-primary-foreground";
  if (isCompleted) return "border-green-500 bg-green-500 text-white";
  return "border-muted-foreground/20 text-muted-foreground/40";
};

// ─── Main component ───────────────────────────────────────────────────────────

const Categorizer = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = React.useState(0);

  const form = useForm<CategorizerFormValues>({
    resolver: zodResolver(categorizerSchema),
    defaultValues: createDefaultCategorizerValues(),
  });

  const acceptedTerms = form.watch("accept");
  const isLastStep = currentStep === STEPS.length - 1;
  const progress = Math.round(((currentStep + 1) / STEPS.length) * 100);

  // Scroll window to top when step changes (page scroll, not inner div)
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentStep]);

  // Fields that must be filled before advancing each step
  const STEP_REQUIRED_FIELDS: Partial<Record<number, Array<keyof CategorizerFormValues>>> = {
    0: ["accept"],
    1: ["fullName", "email", "age", "country", "city", "primaryStatus"],
    2: ["gender", "livingSituation", "spokenLanguages"],
    3: ["profession", "industry"],
    4: [], // income fields optional by nature
    5: ["onlineWeeklySpedingPattern", "priceSensitivityTowardsDigitalProducts"],
    6: ["appUsagePatterns"],
    7: ["everPaidForDigitalContent", "comfortableSubscriptionPrice", "preferredPaymentMethods"],
    8: ["personalityType"],
    9: ["communityParticipationStyle", "preferredCommunitySize"],
    10: ["surveyParticipationFrequency", "maxSurveyTime"],
    11: ["primaryDevice", "techSavviness", "aiToolsUsage"],
    12: ["purchaseDecisionFactor", "sustainabilityImportance"],
    13: ["primaryReasonForJoining"],
    14: ["preferredFeedbackFormat", "gamifiedRewardsForFeedback"],
  };

  const goPrev = () => setCurrentStep((s) => Math.max(0, s - 1));

  const goNext = async () => {
    const fields = STEP_REQUIRED_FIELDS[currentStep] ?? [];
    if (fields.length > 0) {
      const valid = await form.trigger(fields);
      if (!valid) {
        // Scroll to first error so user can see it
        const firstError = document.querySelector("[aria-invalid='true'], .text-destructive");
        firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }
    setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const onSubmit = async (data: CategorizerFormValues) => {
    try {
      await submitCategorizerProfile(data);
      await queryClient.invalidateQueries({ queryKey: queryKeys.me() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
      toast({
        title: "Profile Submitted",
        description: "Your profiling information has been saved.",
      });
      await redirectAfterAuth(navigate, queryClient);
    } catch (err) {
      toast({
        title: "Failed to save profile",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const renderStepContent = () => {
    const c = form.control;

    switch (currentStep) {
      // ── 0: Welcome ──────────────────────────────────────────────────────────
      case 0:
        return (
          <FormField
            control={c}
            name="accept"
            render={({ field }) => (
              <FormItem>
                <button
                  type="button"
                  onClick={() => field.onChange(!field.value)}
                  className={cn(
                    "w-full text-left flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-200",
                    field.value
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                      field.value ? "border-primary bg-primary" : "border-muted-foreground/40"
                    )}
                  >
                    {field.value && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      I agree to participate in this profiling survey
                    </p>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                      By checking this box, you acknowledge that your responses will be used to
                      personalise your experience on Perspectiva. Your data is handled with
                      care and is never sold to third parties.
                    </p>
                  </div>
                </button>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      // ── 1: Basic Info ───────────────────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <TextField control={c} name="fullName" label="Full Name" placeholder="Jane Doe" />
              <TextField control={c} name="email" label="Email Address" placeholder="you@email.com" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <NumberField control={c} name="age" label="Age" placeholder="22" />
              <TextField control={c} name="country" label="Country" placeholder="Singapore" />
              <TextField control={c} name="city" label="City" placeholder="Singapore" />
            </div>
            <SingleSelect
              control={c}
              name="primaryStatus"
              label="What best describes you right now?"
              options={[
                "Secondary school student",
                "Polytechnic student",
                "JC / IB student",
                "University student",
                "Working adult",
                "Founder / self employed",
                "Retired",
                "Unemployed",
                "Independent researcher",
              ]}
              cols={3}
            />
          </div>
        );

      // ── 2: Demographics ─────────────────────────────────────────────────────
      case 2:
        return (
          <div className="space-y-6">
            <SingleSelect
              control={c}
              name="gender"
              label="How do you identify?"
              options={["Male", "Female", "Non-binary / gender diverse", "Prefer not to say"]}
              cols={2}
            />
            <SingleSelect
              control={c}
              name="livingSituation"
              label="What's your current living situation?"
              options={[
                "Alone",
                "With family / parents",
                "With a partner",
                "With roommates / flatmates",
                "Other",
              ]}
              cols={2}
            />
            <MultiSelect
              control={c}
              name="spokenLanguages"
              label="Which languages do you speak?"
              description="Helps us serve you content and surveys in the right language."
              options={[
                "English",
                "Mandarin",
                "Malay",
                "Tamil",
                "Hindi",
                "Tagalog",
                "Vietnamese",
                "Bahasa Indonesia",
                "Korean",
                "Japanese",
                "Other",
              ]}
            />
          </div>
        );

      // ── 3: Profession ───────────────────────────────────────────────────────
      case 3:
        return (
          <div className="space-y-6">
            <TextField
              control={c}
              name="profession"
              label="What's your profession or field of study?"
              placeholder="e.g. Software Engineer, Marketing Student, Graphic Designer..."
              description="Be specific — this helps us route you to the most relevant surveys."
            />
            <SingleSelect
              control={c}
              name="industry"
              label="Which industry or sector best describes your work?"
              options={[
                "Technology & Software",
                "Finance & Banking",
                "Healthcare & Medicine",
                "Education",
                "Retail & E-commerce",
                "Media & Entertainment",
                "Government & Public sector",
                "Marketing & Advertising",
                "Manufacturing & Engineering",
                "Non-profit / Social services",
                "Student — not yet in industry",
                "Other",
              ]}
              cols={2}
            />
          </div>
        );

      // ── 4: Income ───────────────────────────────────────────────────────────
      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <NumberField
                control={c}
                name="monthlyIncome"
                label="Monthly Income (SGD)"
                optional
              />
              <NumberField
                control={c}
                name="monthlyAllowance"
                label="Monthly Allowance (SGD)"
                optional
              />
            </div>
            <MultiSelect
              control={c}
              name="incomeSources"
              label="Where does your income come from?"
              options={[
                "Part-time job",
                "Full-time job",
                "Allowance from parents",
                "Investment",
                "Freelance",
                "Business",
              ]}
            />
          </div>
        );

      // ── 5: Spending ─────────────────────────────────────────────────────────
      case 5:
        return (
          <div className="space-y-6">
            <MultiSelect
              control={c}
              name="majorExpenditures"
              label="What are your major spending categories?"
              options={[
                "Housing / Rent",
                "Food & Dining",
                "Transportation",
                "Entertainment",
                "Shopping",
                "Education",
                "Healthcare",
                "Subscriptions & Streaming",
                "Savings & Investments",
              ]}
            />
            <TextField
              control={c}
              name="mainExpediture"
              label="What's your single biggest expense?"
              placeholder="e.g. Rent, tuition fees, food..."
            />
            <SingleSelect
              control={c}
              name="onlineWeeklySpedingPattern"
              label="How often do you shop online?"
              options={["Multiple times a week", "Weekly", "Monthly", "Rarely", "Never"]}
              cols={2}
            />
            <MultiSelect
              control={c}
              name="onlinePurchaseChannels"
              label="Where do you shop online? (select all that apply)"
              options={[
                "Shopee",
                "Lazada",
                "Amazon",
                "Taobao",
                "Brand websites",
                "Instagram / TikTok shops",
                "Physical stores only",
                "Others",
              ]}
            />
            <SingleSelect
              control={c}
              name="priceSensitivityTowardsDigitalProducts"
              label="How price-sensitive are you towards digital products?"
              options={[
                "Extremely price-sensitive",
                "Somewhat price-sensitive",
                "Neutral",
                "Willing to pay for quality",
              ]}
            />
          </div>
        );

      // ── 6: Digital Life ─────────────────────────────────────────────────────
      case 6:
        return (
          <div className="space-y-6">
            <NumberField
              control={c}
              name="averageDailyScreenTime"
              label="Average daily screen time (hours)"
              placeholder="4"
            />
            <MultiSelect
              control={c}
              name="dailyPlatformUsage"
              label="Which platforms do you use daily?"
              options={[...platformEnum]}
            />
            <SingleSelect
              control={c}
              name="appUsagePatterns"
              label="How do you typically use apps?"
              options={["Quick and frequent", "Long and focused", "Mixed"]}
              cols={3}
            />
            <MultiSelect
              control={c}
              name="favouriteEngagementFeatures"
              label="Which engagement features do you enjoy most?"
              options={[...engagementFeatureEnum]}
            />
          </div>
        );

      // ── 7: Payments ─────────────────────────────────────────────────────────
      case 7:
        return (
          <div className="space-y-6">
            <SingleSelect
              control={c}
              name="everPaidForDigitalContent"
              label="Have you ever paid for a digital product or subscription?"
              options={["Yes", "No"]}
              cols={2}
            />
            <MultiSelect
              control={c}
              name="convincingFactorsForPayment"
              label="What convinces you to pay for something digital?"
              options={[...paymentFactorEnum]}
            />
            <SingleSelect
              control={c}
              name="comfortableSubscriptionPrice"
              label="What monthly subscription price are you comfortable with?"
              options={["Under $5", "$5 to $10", "$10 to $20", "$20 and above"]}
              cols={2}
            />
            <SingleSelect
              control={c}
              name="preferredPaymentMethods"
              label="What payment frequency do you prefer?"
              options={["Monthly", "Annually", "One-time"]}
              cols={3}
            />
          </div>
        );

      // ── 8: Interests ────────────────────────────────────────────────────────
      case 8:
        return (
          <div className="space-y-6">
            <MultiSelect
              control={c}
              name="interests"
              label="What are your main interests and hobbies?"
              description="Select all that apply."
              options={[...interestEnum]}
            />
            <MultiSelect
              control={c}
              name="topicsOfInterest"
              label="Which topics would you most want to share opinions on?"
              description="We'll prioritise surveys in these areas for you."
              options={[...topicOfInterestEnum]}
            />
            <SingleSelect
              control={c}
              name="personalityType"
              label="How would you describe your personality?"
              options={[
                "Very introverted",
                "Somewhat introverted",
                "Somewhat extroverted",
                "Very extroverted",
              ]}
              cols={2}
            />
          </div>
        );

      // ── 9: Community ────────────────────────────────────────────────────────
      case 9:
        return (
          <div className="space-y-6">
            <SingleSelect
              control={c}
              name="communityParticipationStyle"
              label="How do you typically participate in online communities?"
              options={[
                "I mostly observe / lurk",
                "I occasionally comment or react",
                "I actively post and engage",
                "I take on leadership / moderator roles",
              ]}
            />
            <SingleSelect
              control={c}
              name="preferredCommunitySize"
              label="What kind of community would you most enjoy being part of?"
              options={[
                "Small, tight-knit groups (< 50 people)",
                "Medium-sized focused communities (50–500)",
                "Large general interest communities (500+)",
                "I don't participate in communities",
              ]}
            />
            <MultiSelect
              control={c}
              name="communityEngagementMotivations"
              label="What motivates you to engage in a community?"
              options={[...communityEngagementMotivationEnum]}
            />
          </div>
        );

      // ── 10: Surveys ─────────────────────────────────────────────────────────
      case 10:
        return (
          <div className="space-y-6">
            <SingleSelect
              control={c}
              name="surveyParticipationFrequency"
              label="How often do you currently participate in surveys or research?"
              options={["Never", "A few times a year", "Monthly", "Weekly or more"]}
              cols={2}
            />
            <SingleSelect
              control={c}
              name="maxSurveyTime"
              label="What's the maximum time you'd spend on a single survey?"
              options={[
                "Under 2 minutes",
                "2–5 minutes",
                "5–10 minutes",
                "10–20 minutes",
                "20+ minutes (if rewarded well)",
              ]}
              cols={2}
            />
            <MultiSelect
              control={c}
              name="surveyCompletionMotivators"
              label="What makes you more likely to complete a survey?"
              options={[...surveyCompletionMotivatorEnum]}
            />
            <MultiSelect
              control={c}
              name="surveyTurnOffs"
              label="What puts you off completing surveys?"
              options={[...surveyTurnOffEnum]}
            />
          </div>
        );

      // ── 11: Technology ──────────────────────────────────────────────────────
      case 11:
        return (
          <div className="space-y-6">
            <SingleSelect
              control={c}
              name="primaryDevice"
              label="What device do you primarily use day-to-day?"
              options={[
                "Smartphone only",
                "Mostly smartphone, sometimes laptop",
                "Mostly laptop, sometimes smartphone",
                "Desktop / PC primarily",
              ]}
            />
            <SingleSelect
              control={c}
              name="techSavviness"
              label="How tech-savvy would you say you are?"
              options={[
                "I struggle with new technology",
                "I manage but need help sometimes",
                "I'm comfortable with most tech",
                "I'm an early adopter / tech enthusiast",
              ]}
            />
            <SingleSelect
              control={c}
              name="aiToolsUsage"
              label="Do you use AI tools regularly?"
              options={[
                "No, never tried them",
                "I've tried but don't use regularly",
                "Yes, occasionally",
                "Yes, daily",
              ]}
              cols={2}
            />
          </div>
        );

      // ── 12: Values ──────────────────────────────────────────────────────────
      case 12:
        return (
          <div className="space-y-6">
            <SingleSelect
              control={c}
              name="purchaseDecisionFactor"
              label="When making a purchase, what matters most to you?"
              options={[
                "Price / affordability",
                "Quality & durability",
                "Brand reputation",
                "Peer recommendations",
                "Sustainability / ethics",
                "Convenience",
              ]}
              cols={2}
            />
            <MultiSelect
              control={c}
              name="productDiscoveryChannels"
              label="How do you typically discover new products or services?"
              options={[...productDiscoveryChannelEnum]}
            />
            <SingleSelect
              control={c}
              name="sustainabilityImportance"
              label="How important is sustainability / environmental impact in your choices?"
              options={[
                "Not important at all",
                "Slightly important",
                "Moderately important",
                "Very important — it drives my decisions",
              ]}
            />
          </div>
        );

      // ── 13: Goals ───────────────────────────────────────────────────────────
      case 13:
        return (
          <div className="space-y-6">
            <SingleSelect
              control={c}
              name="primaryReasonForJoining"
              label="What's your primary reason for joining Perspectiva?"
              options={[
                "To earn rewards",
                "To share my opinions",
                "To discover surveys / research",
                "To connect with a community",
                "To create surveys / gather data",
                "Just exploring",
              ]}
              cols={2}
            />
            <MultiSelect
              control={c}
              name="loyaltyFactors"
              label="What would make you a loyal, long-term user?"
              options={[...loyaltyFactorEnum]}
            />
          </div>
        );

      // ── 14: Feedback ────────────────────────────────────────────────────────
      case 14:
        return (
          <div className="space-y-6">
            <SingleSelect
              control={c}
              name="preferredFeedbackFormat"
              label="How would you prefer to share feedback with brands or researchers?"
              options={[
                "Surveys",
                "Online I-on-I short interviews",
                "Online group interviews",
                "In-person events",
              ]}
            />
            <SingleSelect
              control={c}
              name="gamifiedRewardsForFeedback"
              label="Would gamified rewards motivate you to give feedback more often?"
              options={["Yes", "Maybe", "No"]}
              cols={3}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppShell backgroundClassName="bg-gradient-subtle">
      {/* Natural page flow — sidebar sticks, nav bar is fixed to viewport bottom */}
      <div className="flex">
        {/* ── Sidebar — sticky to viewport ── */}
        <aside className="hidden md:block w-60 flex-shrink-0 border-r border-border/50">
          <div
            className="sticky flex flex-col bg-card/60 backdrop-blur overflow-hidden"
            style={{ top: "4rem", height: "calc(100dvh - 4rem)" }}
          >
          <div className="px-6 py-5 border-b border-border/50 flex-shrink-0">
            <h2 className="text-sm font-bold bg-gradient-primary bg-clip-text text-transparent">
              Perspectiva
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Profile Setup</p>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">{progress}% complete</p>
          </div>

          {/* Step list */}
          <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              const buttonCls = stepItemCls(isActive, isCompleted);
              const circleCls = stepCircleCls(isActive, isCompleted);

              return (
                <button
                  key={step.id}
                  type="button"
                  disabled={!isCompleted}
                  onClick={() => isCompleted && setCurrentStep(index)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all",
                    buttonCls
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all",
                      circleCls
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-2.5 h-2.5" />
                    ) : (
                      <span className="text-[9px] font-bold leading-none">{index + 1}</span>
                    )}
                  </div>
                  <span className="truncate text-xs font-medium">{step.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="px-6 py-4 border-t border-border/50 flex-shrink-0">
            <p className="text-xs text-muted-foreground">
              {currentStep} of {STEPS.length} sections complete
            </p>
          </div>
          </div>
        </aside>

        {/* ── Main content — natural page flow ── */}
        <div className="flex-1 min-w-0 bg-background" style={{ minHeight: "calc(100dvh - 4rem)" }}>
          {/* Mobile step indicator */}
          <div className="md:hidden flex items-center justify-between px-5 py-3 bg-card/60 border-b border-border/50 backdrop-blur sticky top-16 z-10">
            <span className="text-sm font-medium text-foreground">{STEPS[currentStep].label}</span>
            <span className="text-xs text-muted-foreground">{currentStep + 1} / {STEPS.length}</span>
          </div>

          {/* Progress bar — sticky below app nav */}
          <div className="h-0.5 bg-muted sticky top-16 z-10">
            <div
              className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Form content */}
          <Form {...form}>
            <div className="max-w-2xl mx-auto px-6 md:px-8 pt-10 pb-12 w-full">
              {/* Step header */}
              <div className="mb-8">
                <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Step {currentStep + 1} of {STEPS.length}
                </span>
                <h1 className="text-2xl font-bold text-foreground leading-tight">
                  {STEPS[currentStep].title}
                </h1>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {STEPS[currentStep].subtitle}
                </p>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-6">{renderStepContent()}</div>
              </form>

              {/* Navigation — inline at bottom of form content */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-border/50">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={goPrev}
                  disabled={currentStep === 0}
                  className="gap-1.5 text-muted-foreground"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>

                {isLastStep ? (
                  <Button
                    type="button"
                    className="gap-2 px-8"
                    disabled={form.formState.isSubmitting}
                    onClick={form.handleSubmit(onSubmit)}
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Profile"
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={goNext}
                    className="gap-1.5 px-8"
                    disabled={currentStep === 0 && !acceptedTerms}
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </Form>
        </div>
      </div>
    </AppShell>
  );
};

export default Categorizer;
