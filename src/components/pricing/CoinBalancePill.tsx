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
        "inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5",
        className,
      )}
    >
      <Coins className="h-4 w-4 text-amber-600" />
      <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
        {coins.toLocaleString()} Coins
      </span>
      {showBuyAction ? <BuyCoinsIconLink className="h-7 w-7" /> : null}
    </div>
  );
};

export default CoinBalancePill;
