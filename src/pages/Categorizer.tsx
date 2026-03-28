import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import MultiSelectCheckbox from "@/features/categorizer/components/MultiSelectCheckbox";
import {
  categorizerSchema,
  createDefaultCategorizerValues,
  engagementFeatureEnum,
  paymentFactorEnum,
  platformEnum,
  type CategorizerFormValues,
} from "@/features/categorizer/domain/schema";
import { AppShell } from "@/shared/components/layout/AppShell";
import { api } from "@/lib/api";
import { ROUTES } from "@/lib/routes";

const PRIMARY_STATUS_TO_PROFESSION: Record<string, string> = {
  "Secondary school student": "student",
  "Polytechnic student": "student",
  "JC / IB student": "student",
  "University student": "student",
  "Working adult": "corporate_employee",
  "Founder / self employed": "self_employed",
  "Independent researcher": "independent_researcher",
  "Retired": "other",
  "Unemployed": "other",
};

const TAB_ORDER = [
  "acknowledgement",
  "basic",
  "profession",
  "income",
  "expenditure",
  "digital-activity",
  "payment-pattern",
  "feedback",
] as const;

const Categorizer = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<string>("acknowledgement");

  const form = useForm<CategorizerFormValues>({
    resolver: zodResolver(categorizerSchema),
    defaultValues: createDefaultCategorizerValues(),
  });

  const goNext = () => {
    const currentIndex = TAB_ORDER.indexOf(activeTab as typeof TAB_ORDER[number]);
    if (currentIndex < TAB_ORDER.length - 1) {
      setActiveTab(TAB_ORDER[currentIndex + 1]);
    }
  };

  const onSubmit = async (data: CategorizerFormValues) => {
    const profession = PRIMARY_STATUS_TO_PROFESSION[data.primaryStatus] ?? "other";
    const institution = [data.city, data.country].filter(Boolean).join(", ");

    try {
      await api.put("/users/me", {
        name: data.fullName,
        institution: institution || null,
        sub_category: data.profession || null,
        profession,
      });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Profile Submitted",
        description: "Your profiling information has been saved.",
      });
      navigate(ROUTES.profile);
    } catch (err) {
      toast({
        title: "Failed to save profile",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppShell
      withContainer
      mainClassName="min-h-full max-w-5xl p-4 pt-20"
      backgroundClassName="bg-gradient-subtle"
    >
        <h1 className="text-4xl font-bold mb-6 text-center">
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            Profiling
          </span>
        </h1>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="acknowledgement">Acknowledgement</TabsTrigger>
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="profession">Profession</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expenditure">Expenditure</TabsTrigger>
            <TabsTrigger value="digital-activity">Digital Activity</TabsTrigger>
            <TabsTrigger value="payment-pattern">Payment</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          {/* Acknowledgement Tab */}
          <TabsContent value="acknowledgement" className="mt-6">
            <Card className="p-6 shadow-lg">
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="accept"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to participate in this profiling survey
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            By checking this box, you acknowledge that your data
                            will be collected for research purposes.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    className="w-full bg-gradient-primary shadow-elegant hover:shadow-glow transition-all"
                    disabled={!form.watch("accept")}
                    onClick={goNext}
                  >
                    Next →
                  </Button>
                </form>
              </Form>
            </Card>
          </TabsContent>

          {/* Basic Tab */}
          <TabsContent value="basic" className="mt-6">
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
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
                            placeholder="Enter your email"
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
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter your age"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your country"
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
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your city"
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
                    name="primaryStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Secondary school student">
                              Secondary school student
                            </SelectItem>
                            <SelectItem value="Polytechnic student">
                              Polytechnic student
                            </SelectItem>
                            <SelectItem value="JC / IB student">
                              JC / IB student
                            </SelectItem>
                            <SelectItem value="University student">
                              University student
                            </SelectItem>
                            <SelectItem value="Working adult">
                              Working adult
                            </SelectItem>
                            <SelectItem value="Founder / self employed">
                              Founder / self employed
                            </SelectItem>
                            <SelectItem value="Retired">Retired</SelectItem>
                            <SelectItem value="Unemployed">
                              Unemployed
                            </SelectItem>
                            <SelectItem value="Independent researcher">
                              Independent researcher
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    className="w-full bg-gradient-primary shadow-elegant hover:shadow-glow transition-all"
                    onClick={goNext}
                  >
                    Next →
                  </Button>
                </form>
              </Form>
            </Card>
          </TabsContent>

          {/* Profession Tab */}
          <TabsContent value="profession" className="mt-6">
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="profession"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profession</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your profession"
                            {...field}
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    className="w-full bg-gradient-primary shadow-elegant hover:shadow-glow transition-all"
                    onClick={goNext}
                  >
                    Next →
                  </Button>
                </form>
              </Form>
            </Card>
          </TabsContent>

          {/* Income Tab */}
          <TabsContent value="income" className="mt-6">
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="monthlyIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Income (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter your monthly income"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              )
                            }
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="monthlyAllowance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Allowance</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter your monthly allowance"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="incomeSources"
                    render={() => (
                      <FormItem>
                        <FormLabel>Income Sources</FormLabel>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {[
                            "Part-time job",
                            "Full-time job",
                            "Allowance from parents",
                            "Investment",
                            "Freelance",
                            "Business",
                          ].map((source) => (
                            <FormField
                              key={source}
                              control={form.control}
                              name="incomeSources"
                              render={({ field }) => (
                                <MultiSelectCheckbox
                                  label={source}
                                  onChange={field.onChange}
                                  value={field.value || []}
                                />
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    className="w-full bg-gradient-primary shadow-elegant hover:shadow-glow transition-all"
                    onClick={goNext}
                  >
                    Next →
                  </Button>
                </form>
              </Form>
            </Card>
          </TabsContent>

          {/* Expenditure Tab */}
          <TabsContent value="expenditure" className="mt-6">
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="majorExpenditures"
                    render={() => (
                      <FormItem>
                        <FormLabel>Major Expenditures</FormLabel>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {[
                            "Food & Dining",
                            "Transportation",
                            "Entertainment",
                            "Shopping",
                            "Education",
                            "Healthcare",
                            "Savings",
                          ].map((expense) => (
                            <FormField
                              key={expense}
                              control={form.control}
                              name="majorExpenditures"
                              render={({ field }) => (
                                <MultiSelectCheckbox
                                  label={expense}
                                  onChange={field.onChange}
                                  value={field.value || []}
                                />
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mainExpediture"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Expenditure</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your main expenditure"
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
                    name="onlineWeeklySpedingPattern"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Online Weekly Spending Pattern</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Multiple times a week" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Multiple times a week
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Weekly" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Weekly
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Monthly" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Monthly
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Rarely" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Rarely
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Never" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Never
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="onlinePurchaseChannels"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Online Purchase Channels</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Shopee" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Shopee
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Lazada" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Lazada
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Amazon" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Amazon
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Taobao" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Taobao
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="All e-commerce marketplaces" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                All e-commerce marketplaces
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Brand websites" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Brand websites
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Instagram / TikTok shops" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Instagram / TikTok shops
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Physical stores" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Physical stores
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Others" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Others
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priceSensitivityTowardsDigitalProducts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Price Sensitivity Towards Digital Products
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Extremely price-sensitive" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Extremely price-sensitive
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Somewhat price-sensitive" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Somewhat price-sensitive
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Neutral" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Neutral
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Willing to pay for quality" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Willing to pay for quality
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    className="w-full bg-gradient-primary shadow-elegant hover:shadow-glow transition-all"
                    onClick={goNext}
                  >
                    Next →
                  </Button>
                </form>
              </Form>
            </Card>
          </TabsContent>

          {/* Digital Activity Tab */}
          <TabsContent value="digital-activity" className="mt-6">
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="averageDailyScreenTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Average Daily Screen Time (hours)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter your average daily screen time"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dailyPlatformUsage"
                    render={() => (
                      <FormItem>
                        <FormLabel>Daily Platform Usage</FormLabel>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {platformEnum.map((platform) => (
                            <FormField
                              key={platform}
                              control={form.control}
                              name="dailyPlatformUsage"
                              render={({ field }) => (
                                <MultiSelectCheckbox
                                  label={platform}
                                  onChange={field.onChange}
                                  value={field.value || []}
                                />
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mostUsedPlatform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Most Used Platform</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your most used platform"
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
                    name="appUsagePatterns"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>App Usage Patterns</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Quick and frequent" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Quick and frequent
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Long and focused" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Long and focused
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Mixed" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Mixed
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="favouriteEngagementFeatures"
                    render={() => (
                      <FormItem>
                        <FormLabel>Favourite Engagement Features</FormLabel>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {engagementFeatureEnum.map((feature) => (
                            <FormField
                              key={feature}
                              control={form.control}
                              name="favouriteEngagementFeatures"
                              render={({ field }) => (
                                <MultiSelectCheckbox
                                  label={feature}
                                  onChange={field.onChange}
                                  value={field.value || []}
                                />
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    className="w-full bg-gradient-primary shadow-elegant hover:shadow-glow transition-all"
                    onClick={goNext}
                  >
                    Next →
                  </Button>
                </form>
              </Form>
            </Card>
          </TabsContent>

          {/* Payment Pattern Tab */}
          <TabsContent value="payment-pattern" className="mt-6">
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="everPaidForDigitalContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ever Paid for Digital Content</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Yes" />
                              </FormControl>
                              <FormLabel className="font-normal">Yes</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="No" />
                              </FormControl>
                              <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="convincingFactorsForPayment"
                    render={() => (
                      <FormItem>
                        <FormLabel>Convincing Factors for Payment</FormLabel>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {paymentFactorEnum.map((factor) => (
                            <FormField
                              key={factor}
                              control={form.control}
                              name="convincingFactorsForPayment"
                              render={({ field }) => (
                                <MultiSelectCheckbox
                                  label={factor}
                                  onChange={field.onChange}
                                  value={field.value || []}
                                />
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comfortableSubscriptionPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comfortable Subscription Price</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Under $5" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Under $5
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="$5 to $10" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                $5 to $10
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="$10 to $20" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                $10 to $20
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="$20 and above" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                $20 and above
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredPaymentMethods"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Payment Methods</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Monthly" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Monthly
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Annually" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Annually
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="One-time" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                One-time
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    className="w-full bg-gradient-primary shadow-elegant hover:shadow-glow transition-all"
                    onClick={goNext}
                  >
                    Next →
                  </Button>
                </form>
              </Form>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="mt-6">
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="preferredFeedbackFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Feedback Format</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Surveys" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Surveys
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Online I-on-I short interviews" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Online I-on-I short interviews
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Online group interviews" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Online group interviews
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="In-person events" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                In-person events
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gamifiedRewardsForFeedback"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gamified Rewards for Feedback</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Yes" />
                              </FormControl>
                              <FormLabel className="font-normal">Yes</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Maybe" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Maybe
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="No" />
                              </FormControl>
                              <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary shadow-elegant hover:shadow-glow transition-all"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </form>
              </Form>
            </Card>
          </TabsContent>
        </Tabs>
    </AppShell>
  );
};

export default Categorizer;
