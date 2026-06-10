import { ChangeEvent, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  POINTS_TO_COINS_RATE,
  convertCoinsToPoints,
  convertPointsToCoins,
} from "@/features/pricing/domain/pricing-data";
import { ArrowRightLeft, Coins, Loader2, Sparkles, Trophy } from "lucide-react";
import { AppShell } from "@/shared/components/layout/AppShell";
import { api } from "@/lib/api";
import { queryKeys, invalidateUserProfile } from "@/lib/query-keys";
import { useToast } from "@/hooks/use-toast";

interface ApiUser {
  points_balance: number;
  coins_balance: number;
}

interface ConvertResponse {
  points_spent: number;
  coins_added: number;
  new_points_balance: number;
  new_coins_balance: number;
}

type ParsedInput = {
  value: number | null;
  error: string | null;
};

const normalizeNumericInput = (rawValue: string): ParsedInput => {
  const trimmed = rawValue.trim();
  if (trimmed.length === 0) {
    return { value: null, error: "Value is required." };
  }

  const parsedValue = Number(trimmed.replace(/,/g, ""));
  if (!Number.isFinite(parsedValue)) {
    return { value: null, error: "Enter a valid number." };
  }
  if (parsedValue < 0) {
    return { value: null, error: "Value must be zero or greater." };
  }

  return { value: parsedValue, error: null };
};

const formatConvertedValue = (value: number): string => {
  const rounded = Math.round(value * 10000) / 10000;
  return Number.isInteger(rounded)
    ? rounded.toString()
    : rounded.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
};

const Converter = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [pointsInput, setPointsInput] = useState("120");
  const [coinsInput, setCoinsInput] = useState(
    formatConvertedValue(convertPointsToCoins(120)),
  );
  const [pointsError, setPointsError] = useState<string | null>(null);
  const [coinsError, setCoinsError] = useState<string | null>(null);

  const balanceQ = useQuery({
    queryKey: queryKeys.me(),
    queryFn: () => api.get<ApiUser>("/users/me"),
    staleTime: 30_000,
  });

  const convertMutation = useMutation({
    mutationFn: (points: number) =>
      api.post<ConvertResponse>("/payments/coins/convert-from-points", { points }),
    onSuccess: async (data) => {
      await invalidateUserProfile(queryClient);
      toast({
        title: "Conversion successful!",
        description: `${data.points_spent} points → ${data.coins_added} coins`,
      });
    },
    onError: (err) => {
      toast({
        title: "Conversion failed",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const handlePointsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextPoints = event.target.value;
    setPointsInput(nextPoints);

    const parsedInput = normalizeNumericInput(nextPoints);
    if (parsedInput.error || parsedInput.value === null) {
      setPointsError(parsedInput.error);
      return;
    }

    setPointsError(null);
    setCoinsError(null);
    setCoinsInput(formatConvertedValue(convertPointsToCoins(parsedInput.value)));
  };

  const handleCoinsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextCoins = event.target.value;
    setCoinsInput(nextCoins);

    const parsedInput = normalizeNumericInput(nextCoins);
    if (parsedInput.error || parsedInput.value === null) {
      setCoinsError(parsedInput.error);
      return;
    }

    setPointsError(null);
    setCoinsError(null);
    setPointsInput(formatConvertedValue(convertCoinsToPoints(parsedInput.value)));
  };

  const handleConvert = () => {
    const parsed = normalizeNumericInput(pointsInput);
    if (parsed.error || parsed.value === null || parsed.value === 0) {
      setPointsError(parsed.error ?? "Enter a positive points amount.");
      return;
    }
    if (!Number.isInteger(parsed.value)) {
      setPointsError("Points must be a whole number.");
      return;
    }
    convertMutation.mutate(parsed.value);
  };

  const pointsBalance = balanceQ.data?.points_balance ?? 0;
  const coinsBalance  = balanceQ.data?.coins_balance  ?? 0;
  const parsedPoints  = normalizeNumericInput(pointsInput);
  const canConvert    = !parsedPoints.error && (parsedPoints.value ?? 0) > 0 && (parsedPoints.value ?? 0) <= pointsBalance;

  return (
    <AppShell
      withContainer
      mainClassName="mx-auto max-w-5xl px-4 pb-12 pt-24"
      backgroundClassName="bg-gradient-subtle"
    >
      <header className="mb-8">
        <Badge className="mb-4 border-primary/20 bg-primary/10 text-primary">
          Points → Coins
        </Badge>
        <h1 className="text-4xl font-bold">
          Points{" "}
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            <ArrowRightLeft className="mr-2 inline h-8 w-8" />
            Coins Converter
          </span>
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Convert your earned points into coins to use on platform features.
        </p>
      </header>

      {/* Balance display */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <Card className="border-border/50 bg-card/60 p-4 backdrop-blur flex items-center gap-3">
          <Trophy className="h-6 w-6 text-primary flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Your Points</p>
            <p className="text-2xl font-bold text-primary tabular-nums">
              {balanceQ.isPending ? "…" : pointsBalance.toLocaleString()}
            </p>
          </div>
        </Card>
        <Card className="border-border/50 bg-card/60 p-4 backdrop-blur flex items-center gap-3">
          <Coins className="h-6 w-6 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Your Coins</p>
            <p className="text-2xl font-bold text-amber-600 tabular-nums">
              {balanceQ.isPending ? "…" : coinsBalance.toLocaleString()}
            </p>
          </div>
        </Card>
      </div>

      <Card className="mb-6 border-border/50 bg-card/60 p-5 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
            Current rate
          </Badge>
          <p className="text-sm text-muted-foreground">
            1 point = <span className="font-semibold text-foreground">{POINTS_TO_COINS_RATE} coins</span>
          </p>
        </div>
      </Card>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 bg-card/60 p-6 backdrop-blur">
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Points to Convert</h2>
          </div>
          <Label htmlFor="points-input" className="mb-2 block">
            Points (whole numbers only)
          </Label>
          <Input
            id="points-input"
            value={pointsInput}
            onChange={handlePointsChange}
            inputMode="numeric"
            placeholder="Enter points"
            aria-invalid={Boolean(pointsError)}
          />
          {pointsError ? (
            <p className="mt-2 text-sm text-destructive">{pointsError}</p>
          ) : parsedPoints.value !== null && parsedPoints.value > pointsBalance ? (
            <p className="mt-2 text-sm text-destructive">
              Insufficient points (you have {pointsBalance.toLocaleString()})
            </p>
          ) : null}
          <div className="mt-5 rounded-lg border border-primary/15 bg-primary/5 p-3 text-sm">
            You will receive:{" "}
            <span className="font-bold text-amber-600">{coinsInput || "--"} coins</span>
          </div>
        </Card>

        <Card className="border-border/50 bg-card/60 p-6 backdrop-blur">
          <div className="mb-4 flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold">Coins Reference</h2>
          </div>
          <Label htmlFor="coins-input" className="mb-2 block">
            Coins equivalent
          </Label>
          <Input
            id="coins-input"
            value={coinsInput}
            onChange={handleCoinsChange}
            inputMode="decimal"
            placeholder="Enter coins"
            aria-invalid={Boolean(coinsError)}
          />
          {coinsError ? (
            <p className="mt-2 text-sm text-destructive">{coinsError}</p>
          ) : null}
          <div className="mt-5 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm">
            Points needed:{" "}
            <span className="font-semibold">{pointsInput || "--"}</span>
          </div>
        </Card>
      </section>

      {/* Convert action */}
      <Card className="mt-6 border-border/50 bg-card/60 p-6 backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">
              Convert <span className="text-primary">{pointsInput || "0"} points</span> →{" "}
              <span className="text-amber-600">{coinsInput || "0"} coins</span>
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">This action is irreversible.</p>
          </div>
          <Button
            onClick={handleConvert}
            disabled={!canConvert || convertMutation.isPending}
            className="shrink-0"
          >
            {convertMutation.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Converting...</>
            ) : (
              <><ArrowRightLeft className="mr-2 h-4 w-4" />Convert Now</>
            )}
          </Button>
        </div>
      </Card>

      <Card className="mt-4 border-border/50 bg-card/60 p-5 backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm text-muted-foreground">
              Points are earned by completing surveys and unlocking achievements.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Example: 120 points = {formatConvertedValue(convertPointsToCoins(120))} coins
          </p>
        </div>
      </Card>
    </AppShell>
  );
};

export default Converter;
