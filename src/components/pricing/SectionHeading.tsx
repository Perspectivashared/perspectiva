import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description: string;
  className?: string;
}

const SectionHeading = ({
  eyebrow,
  title,
  description,
  className,
}: SectionHeadingProps) => {
  return (
    <div className={cn("mb-6 max-w-3xl", className)}>
      {eyebrow ? (
        <p className="mb-2 text-eyebrow font-semibold uppercase tracking-widest text-[hsl(195_85%_28%)] dark:text-[hsl(195_85%_72%)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-semibold tracking-normal">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {description}
      </p>
    </div>
  );
};

export default SectionHeading;
