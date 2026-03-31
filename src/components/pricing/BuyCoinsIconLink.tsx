import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface BuyCoinsIconLinkProps {
  className?: string;
}

const BuyCoinsIconLink = ({ className }: BuyCoinsIconLinkProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          asChild
          size="icon"
          variant="outline"
          className={cn(
            "h-8 w-8 rounded-full border-amber-500/40 bg-amber-500/10 text-amber-700 [--btn-ring:rgb(245_158_11_/_0.4)] hover:border-amber-500/70 hover:bg-amber-500/20 hover:text-amber-800 focus-visible:ring-amber-500/40 dark:text-amber-300 dark:hover:text-amber-200",
            className,
          )}
        >
          <Link to={ROUTES.pricing} aria-label="Buy Coins">
            <Plus className="h-4 w-4" />
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Buy Coins</TooltipContent>
    </Tooltip>
  );
};

export default BuyCoinsIconLink;
