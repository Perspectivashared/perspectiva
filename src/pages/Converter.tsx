import { ChangeEvent, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  POINTS_TO_COINS_RATE,
  convertCoinsToPoints,
  convertPointsToCoins,
} from "@/features/pricing/domain/pricing-data";
import { ArrowRightLeft, Coins, Sparkles, Trophy } from "lucide-react";
import { AppShell } from "@/shared/components/layout/AppShell";

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
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
};

const Converter = () => {
  const [pointsInput, setPointsInput] = useState("10");
  const [coinsInput, setCoinsInput] = useState(
    formatConvertedValue(convertPointsToCoins(10)),
  );
  const [pointsError, setPointsError] = useState<string | null>(null);
  const [coinsError, setCoinsError] = useState<string | null>(null);

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

  return (
    <AppShell
      withContainer
      mainClassName="mx-auto max-w-5xl px-4 pb-12 pt-24"
      backgroundClassName="bg-gradient-subtle"
    >
        <header className="mb-8">
          <Badge className="mb-4 border-primary/20 bg-primary/10 text-primary">
            Live conversion utility
          </Badge>
          <h1 className="text-4xl font-bold">
            Points{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              <ArrowRightLeft className="mr-2 inline h-8 w-8" />
              Coins Converter
            </span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Convert in both directions using the current platform rate.
          </p>
        </header>

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
              <h2 className="text-lg font-semibold">Points to Coins</h2>
            </div>
            <Label htmlFor="points-input" className="mb-2 block">
              Points
            </Label>
            <Input
              id="points-input"
              value={pointsInput}
              onChange={handlePointsChange}
              inputMode="decimal"
              placeholder="Enter points"
              aria-invalid={Boolean(pointsError)}
            />
            {pointsError ? (
              <p className="mt-2 text-sm text-destructive">{pointsError}</p>
            ) : null}
            <div className="mt-5 rounded-lg border border-primary/15 bg-primary/5 p-3 text-sm">
              Coins equivalent:{" "}
              <span className="font-semibold">{coinsInput || "--"}</span>
            </div>
          </Card>

          <Card className="border-border/50 bg-card/60 p-6 backdrop-blur">
            <div className="mb-4 flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-semibold">Coins to Points</h2>
            </div>
            <Label htmlFor="coins-input" className="mb-2 block">
              Coins
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
              Points equivalent:{" "}
              <span className="font-semibold">{pointsInput || "--"}</span>
            </div>
          </Card>
        </section>

        <Card className="mt-6 border-border/50 bg-card/60 p-6 backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm text-muted-foreground">
                Tip: you can use decimal values for partial conversions.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Example: 15 points = {formatConvertedValue(convertPointsToCoins(15))} coins
            </p>
          </div>
        </Card>
    </AppShell>
  );
};

export default Converter;
