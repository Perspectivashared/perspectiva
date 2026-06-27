import { Skeleton } from "@/components/ui/skeleton";

interface PageHeaderCardProps {
  title: string;
  description: string;
  countLabel?: string;
  isLoading?: boolean;
}

export const PageHeaderCard = ({
  title,
  description,
  countLabel,
  isLoading = false,
}: PageHeaderCardProps) => (
  <section className="mb-10 space-y-2 rounded-xl border border-primary/15 bg-linear-to-r from-primary/8 via-card to-card p-5">
    {isLoading ? (
      <>
        <Skeleton className="mb-3 h-12 w-72" />
        <Skeleton className="h-5 w-full max-w-3xl" />
      </>
    ) : (
      <>
        <h1 className="mb-3 text-4xl font-bold">
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            {title}
          </span>
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
          {description}
        </p>
        {countLabel && (
          <p className="text-sm text-muted-foreground">{countLabel}</p>
        )}
      </>
    )}
  </section>
);
