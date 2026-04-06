import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ErrorCardProps {
  title: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorCard = ({ title, message, onRetry }: ErrorCardProps) => (
  <Card className="border-border/70 p-8 text-center shadow-sm">
    <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
    {message && (
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    )}
    {onRetry && (
      <Button onClick={onRetry} className="mt-5">
        Try again
      </Button>
    )}
  </Card>
);
