import BuyCoinsIconLink from "@/components/pricing/BuyCoinsIconLink";
import { cn } from "@/lib/utils";
import { Coins } from "lucide-react";

interface CoinBalancePillProps {
  coins: number;
  className?: string;
  showBuyAction?: boolean;
}

const CoinBalancePill = ({
  coins,
  className,
  showBuyAction = false,
}: CoinBalancePillProps) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[hsl(var(--coin)/0.3)] bg-[hsl(var(--coin)/0.1)] px-3 py-1.5",
        className,
      )}
    >
      <Coins className="h-4 w-4 text-[hsl(var(--coin))]" />
      <span className="font-mono text-sm font-semibold tabular-nums text-[hsl(38_92%_28%)] dark:text-[hsl(38_95%_72%)]">
        {coins.toLocaleString()} Coins
      </span>
      {showBuyAction ? <BuyCoinsIconLink className="h-7 w-7" /> : null}
    </div>
  );
};

export default CoinBalancePill;
