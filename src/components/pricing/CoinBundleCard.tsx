import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CoinBundle, getTotalCoinsForBundle } from "@/lib/pricing-data";
import { cn } from "@/lib/utils";
import { Coins, Loader2 } from "lucide-react";
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
        "relative h-full p-6 border-border/50 bg-card/50 backdrop-blur",
        bundle.recommended ? "border-primary shadow-elegant" : "hover:shadow-elegant transition-all",
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">
            {bundle.coins.toLocaleString()} Coins
          </h3>
          {bundle.bonusCoins ? (
            <p className="mt-1 text-sm text-success">
              +{bundle.bonusCoins.toLocaleString()} bonus coins
            </p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          {bundle.discountPercent ? (
            <Badge className="bg-success/10 text-success border-success/20">
              Save {bundle.discountPercent}%
            </Badge>
          ) : null}
          {bundle.recommended ? (
            <Badge className="bg-gradient-primary text-white">Popular</Badge>
          ) : null}
        </div>
      </div>

      <div className="mb-5 flex items-center gap-2">
        <Coins className="h-5 w-5 text-amber-600" />
        <span className="text-sm text-muted-foreground">
          Total coins delivered: {totalCoins.toLocaleString()}
        </span>
      </div>

      <div className="mb-6">
        <div className="text-3xl font-bold">{currencyFormatter.format(bundle.price)}</div>
        <p className="mt-1 text-sm text-muted-foreground">
          {currencyFormatter.format(pricePerCoin)} per coin
        </p>
      </div>

      <Button
        className={cn(
          "w-full",
          bundle.recommended
            ? "bg-gradient-primary shadow-elegant hover:shadow-glow transition-all"
            : "",
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
