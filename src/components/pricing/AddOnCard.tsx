import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AddOn } from "@/lib/pricing-data";
import { Plus } from "lucide-react";

interface AddOnCardProps {
  addon: AddOn;
}

const AddOnCard = ({ addon }: AddOnCardProps) => {
  return (
    <Card className="flex gap-4 p-4 border-border/50 bg-card/50 backdrop-blur transition-all hover:shadow-sm">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Plus className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <h4 className="text-sm font-semibold leading-tight">{addon.name}</h4>
          {addon.includedIn && (
            <Badge className="shrink-0 border-success/20 bg-success/10 px-1.5 py-0 text-xs text-success">
              {addon.includedIn}
            </Badge>
          )}
        </div>
        <p className="mt-1 text-xs leading-snug text-muted-foreground">
          {addon.description}
        </p>
        <p className="mt-2 text-xs font-semibold text-primary">{addon.pricing}</p>
      </div>
    </Card>
  );
};

export default AddOnCard;
