import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { AppShell } from "@/shared/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  FileText,
  BarChart3,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Lock,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/features/auth/context/AuthContext";

interface PlatformStats {
  total_users: number;
  total_surveys: number;
  total_responses: number;
  published_surveys: number;
  draft_surveys: number;
  closed_surveys: number;
}

interface AdminUser {
  id: number;
  name: string;
  username: string;
  email: string | null;
  is_admin: boolean;
  is_active: boolean;
  email_verified: boolean;
  profession: string;
  points_balance: number;
  coins_balance: number;
  created_at: string;
}

interface AdminSurvey {
  id: number;
  title: string;
  category: string | null;
  status: string;
  response_count: number;
  created_at: string;
  published_at: string | null;
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number | undefined; icon: React.ElementType }) {
  return (
    <Card className="border-border/50 bg-card/50 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          {value === undefined ? (
            <Skeleton className="mt-1 h-8 w-16" />
          ) : (
            <p className="mt-1 text-3xl font-bold">{value.toLocaleString()}</p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </Card>
  );
}

const Admin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const [userSearch, setUserSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [surveyStatusFilter, setSurveyStatusFilter] = useState("");
  const [confirmingToggle, setConfirmingToggle] = useState<number | null>(null);
  const [confirmingClose, setConfirmingClose] = useState<number | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Access check — must come before conditional returns
  const meQuery = useQuery({
    queryKey: queryKeys.me(),
    queryFn: () => api.get<{ is_admin: boolean }>("/users/me"),
    enabled: isAuthenticated === true,
  });

  const statsQuery = useQuery({
    queryKey: queryKeys.adminStats(),
    queryFn: () => api.get<PlatformStats>("/admin/stats"),
    enabled: meQuery.data?.is_admin === true,
  });

  const usersQuery = useQuery({
    queryKey: queryKeys.adminUsers(debouncedSearch),
    queryFn: () =>
      api.get<AdminUser[]>(`/admin/users${debouncedSearch ? `?q=${encodeURIComponent(debouncedSearch)}` : ""}`),
    enabled: meQuery.data?.is_admin === true,
  });

  const surveysQuery = useQuery({
    queryKey: queryKeys.adminSurveys(surveyStatusFilter),
    queryFn: () =>
      api.get<AdminSurvey[]>(`/admin/surveys${surveyStatusFilter ? `?status=${surveyStatusFilter}` : ""}`),
    enabled: meQuery.data?.is_admin === true,
  });

  const toggleAdminMutation = useMutation({
    mutationFn: (userId: number) =>
      api.put<AdminUser>(`/admin/users/${userId}/toggle-admin`),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Admin status updated",
        description: `${data.name} is now ${data.is_admin ? "an admin" : "a regular user"}.`,
      });
      setConfirmingToggle(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update admin status.", variant: "destructive" });
      setConfirmingToggle(null);
    },
  });

  const closeSurveyMutation = useMutation({
    mutationFn: (surveyId: number) =>
      api.post<AdminSurvey>(`/admin/surveys/${surveyId}/close`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-surveys"] });
      toast({ title: "Survey closed", description: "The survey has been closed." });
      setConfirmingClose(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to close survey.", variant: "destructive" });
      setConfirmingClose(null);
    },
  });

  const deleteSurveyMutation = useMutation({
    mutationFn: (surveyId: number) =>
      api.delete<void>(`/admin/surveys/${surveyId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-surveys"] });
      toast({ title: "Survey deleted", description: "The survey has been permanently deleted." });
      setConfirmingDelete(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete survey.", variant: "destructive" });
      setConfirmingDelete(null);
    },
  });

  // Access denied guard
  if (meQuery.data && !meQuery.data.is_admin) {
    return (
      <AppShell withContainer mainClassName="max-w-5xl px-4 pb-12 pt-24">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-destructive">Access Denied</h2>
          <p className="text-muted-foreground mt-2">Admin access required.</p>
        </Card>
      </AppShell>
    );
  }

  const handleUserSearchChange = (value: string) => {
    setUserSearch(value);
    if (searchDebounceRef.current !== null) {
      clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      searchDebounceRef.current = null;
    }, 400);
  };

  const stats = statsQuery.data;

  return (
    <AppShell withContainer mainClassName="max-w-6xl px-4 pb-12 pt-24" backgroundClassName="bg-gradient-subtle">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-primary bg-clip-text text-transparent">Admin Dashboard</span>
          </h1>
          <p className="text-sm text-muted-foreground">Platform management and oversight</p>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="surveys">Surveys</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total Users" value={stats?.total_users} icon={Users} />
            <StatCard label="Total Surveys" value={stats?.total_surveys} icon={FileText} />
            <StatCard label="Total Responses" value={stats?.total_responses} icon={BarChart3} />
            <StatCard label="Published Surveys" value={stats?.published_surveys} icon={ShieldCheck} />
            <StatCard label="Draft Surveys" value={stats?.draft_surveys} icon={Lock} />
            <StatCard label="Closed Surveys" value={stats?.closed_surveys} icon={ShieldOff} />
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="p-4 border-b border-border/50">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => handleUserSearchChange(e.target.value)}
                  className="pl-9 pr-9"
                />
                {userSearch && (
                  <button
                    onClick={() => { setUserSearch(""); setDebouncedSearch(""); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name / Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Profession</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead className="text-right">Coins</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersQuery.isPending ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : usersQuery.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    usersQuery.data?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.email ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm">{user.profession || "—"}</TableCell>
                        <TableCell className="text-right text-sm font-medium">{user.points_balance.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-sm font-medium">{user.coins_balance.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.is_admin && (
                              <Badge variant="default" className="text-xs">Admin</Badge>
                            )}
                            {user.email_verified && (
                              <Badge variant="secondary" className="text-xs">Verified</Badge>
                            )}
                            {!user.is_active && (
                              <Badge variant="destructive" className="text-xs">Inactive</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {confirmingToggle === user.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs text-muted-foreground">Confirm?</span>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={toggleAdminMutation.isPending}
                                onClick={() => toggleAdminMutation.mutate(user.id)}
                              >
                                {toggleAdminMutation.isPending ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : "Yes"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setConfirmingToggle(null)}
                              >
                                No
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setConfirmingToggle(user.id)}
                            >
                              {user.is_admin ? (
                                <><ShieldOff className="mr-1.5 h-3.5 w-3.5" />Remove Admin</>
                              ) : (
                                <><ShieldCheck className="mr-1.5 h-3.5 w-3.5" />Make Admin</>
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Surveys Tab */}
        <TabsContent value="surveys">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="p-4 border-b border-border/50 flex items-center gap-3">
              <p className="text-sm font-medium text-muted-foreground">Filter by status:</p>
              <div className="flex gap-2">
                {[
                  { value: "", label: "All" },
                  { value: "published", label: "Published" },
                  { value: "draft", label: "Draft" },
                  { value: "closed", label: "Closed" },
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    size="sm"
                    variant={surveyStatusFilter === opt.value ? "default" : "outline"}
                    onClick={() => setSurveyStatusFilter(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Responses</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {surveysQuery.isPending ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : surveysQuery.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                        No surveys found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    surveysQuery.data?.map((survey) => (
                      <TableRow key={survey.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">{survey.title}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{survey.category ?? "—"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              survey.status === "published"
                                ? "default"
                                : survey.status === "draft"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="text-xs capitalize"
                          >
                            {survey.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm">{survey.response_count.toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {survey.published_at
                            ? new Date(survey.published_at).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Close action */}
                            {survey.status !== "closed" && (
                              confirmingClose === survey.id ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-muted-foreground">Close?</span>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    disabled={closeSurveyMutation.isPending}
                                    onClick={() => closeSurveyMutation.mutate(survey.id)}
                                  >
                                    {closeSurveyMutation.isPending ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : "Yes"}
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setConfirmingClose(null)}>No</Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setConfirmingClose(survey.id)}
                                >
                                  <Lock className="mr-1.5 h-3.5 w-3.5" />
                                  Close
                                </Button>
                              )
                            )}
                            {/* Delete action */}
                            {confirmingDelete === survey.id ? (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">Delete?</span>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  disabled={deleteSurveyMutation.isPending}
                                  onClick={() => deleteSurveyMutation.mutate(survey.id)}
                                >
                                  {deleteSurveyMutation.isPending ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : "Yes"}
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setConfirmingDelete(null)}>No</Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/40"
                                onClick={() => setConfirmingDelete(survey.id)}
                              >
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
};

export default Admin;
