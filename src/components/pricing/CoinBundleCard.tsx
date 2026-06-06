import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BUTTON_STYLES } from "@/lib/button-styles";
import { CoinBundle, getTotalCoinsForBundle } from "@/features/pricing/domain/pricing-data";
import { cn } from "@/lib/utils";
import { Coins, Loader2, Sparkles } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface CoinBundleCardProps {
  bundle: CoinBundle;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const CoinBundleCard = ({ bundle }: CoinBundleCardProps) => {
  const totalCoins = getTotalCoinsForBundle(bundle);
  const pricePerCoin = bundle.price / totalCoins;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: () =>
      api.post("/payments/coins/purchase", {
        coins: totalCoins,
        bundle_name: `${bundle.coins} Coins`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: `Coins purchased! ${totalCoins} coins added to your balance.` });
    },
    onError: () => {
      toast({ title: "Failed to purchase coins", variant: "destructive" });
    },
  });

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col overflow-hidden border-border/80 bg-card p-5 shadow-sm transition-all hover:border-foreground/25",
        bundle.recommended
          ? "border-[hsl(38_92%_38%/0.72)] shadow-[0_18px_48px_-26px_hsl(38_92%_38%/0.55)] ring-1 ring-[hsl(38_92%_38%/0.22)] dark:border-[hsl(38_92%_62%/0.72)] dark:shadow-[0_18px_48px_-26px_hsl(38_92%_62%/0.45)] dark:ring-[hsl(38_92%_62%/0.24)]"
          : "",
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[hsl(32_95%_28%)] dark:text-[hsl(38_92%_72%)]">
            Coin Bundle
          </p>
          <h3 className="text-2xl font-semibold tracking-normal">
            {bundle.coins.toLocaleString()} Coins
          </h3>
          {bundle.bonusCoins ? (
            <p className="mt-1 text-sm font-medium text-[hsl(142_76%_24%)] dark:text-[hsl(142_76%_70%)]">
              +{bundle.bonusCoins.toLocaleString()} bonus coins
            </p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          {bundle.discountPercent ? (
            <Badge className="border-[hsl(142_76%_28%/0.25)] bg-[hsl(142_76%_28%/0.10)] text-[hsl(142_76%_24%)] dark:border-[hsl(142_76%_62%/0.25)] dark:bg-[hsl(142_76%_62%/0.12)] dark:text-[hsl(142_76%_70%)]">
              Save {bundle.discountPercent}%
            </Badge>
          ) : null}
          {bundle.recommended ? (
            <Badge className="border-[hsl(32_95%_28%/0.25)] bg-[hsl(38_92%_88%)] text-[hsl(32_95%_22%)] dark:border-[hsl(38_92%_72%/0.25)] dark:bg-[hsl(38_92%_72%)] dark:text-[hsl(210_20%_8%)]">
              Popular
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="mb-5 rounded-md border border-border/80 bg-muted/35 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Coins className="h-5 w-5 text-[hsl(32_95%_30%)] dark:text-[hsl(38_92%_72%)]" />
          Total coins delivered
        </div>
        <p className="mt-2 text-3xl font-bold tracking-normal tabular-nums">
          {totalCoins.toLocaleString()}
        </p>
      </div>

      <div className="mb-6 mt-auto">
        <div className="text-3xl font-bold tracking-normal">
          {currencyFormatter.format(bundle.price)}
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-[hsl(32_95%_30%)] dark:text-[hsl(38_92%_72%)]" />
          {currencyFormatter.format(pricePerCoin)} per coin
        </p>
      </div>

      <Button
        className={cn(
          BUTTON_STYLES.cardBase,
          bundle.recommended
            ? BUTTON_STYLES.coinPrimary
            : BUTTON_STYLES.cardOutline,
        )}
        variant={bundle.recommended ? "default" : "outline"}
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Purchasing...
          </>
        ) : (
          "Buy Bundle"
        )}
      </Button>
    </Card>
  );
};

export default CoinBundleCard;
