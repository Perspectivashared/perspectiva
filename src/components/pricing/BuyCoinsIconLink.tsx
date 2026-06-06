import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BUTTON_STYLES } from "@/lib/button-styles";
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
            BUTTON_STYLES.coinIcon,
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
