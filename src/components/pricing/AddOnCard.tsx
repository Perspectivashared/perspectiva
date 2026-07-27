import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AddOn } from "@/features/pricing/domain/pricing-data";
import { CheckCircle2, Plus } from "lucide-react";

interface AddOnCardProps {
  addon: AddOn;
}

const AddOnCard = ({ addon }: AddOnCardProps) => {
  return (
    <Card className="flex h-full gap-4 border-border/80 bg-card p-4 shadow-xs transition-colors hover:border-foreground/25">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40">
        {addon.includedIn ? (
          <CheckCircle2 className="h-4 w-4 text-[hsl(142_76%_28%)] dark:text-[hsl(142_76%_62%)]" />
        ) : (
          <Plus className="h-4 w-4 text-primary" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
          <h4 className="text-base font-semibold leading-tight tracking-normal">
            {addon.name}
          </h4>
          {addon.includedIn && (
            <Badge className="shrink-0 border-[hsl(142_76%_28%/0.25)] bg-[hsl(142_76%_28%/0.10)] px-2 py-0.5 text-xs text-[hsl(142_76%_24%)] dark:border-[hsl(142_76%_62%/0.25)] dark:bg-[hsl(142_76%_62%/0.12)] dark:text-[hsl(142_76%_70%)]">
              {addon.includedIn}
            </Badge>
          )}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {addon.description}
        </p>
        <p className="mt-3 text-sm font-semibold text-primary">
          {addon.pricing}
        </p>
      </div>
    </Card>
  );
};

export default AddOnCard;
