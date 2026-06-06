import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/shared/components/layout/AppShell";

const NotFound = () => {
  return (
    <AppShell withContainer mainClassName="flex min-h-[70vh] flex-col items-center justify-center px-4 py-24 text-center">
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">404</p>
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Page not found
      </h1>
      <p className="mb-8 max-w-md text-base text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild>
        <Link to={ROUTES.home}>Return to Home</Link>
      </Button>
    </AppShell>
  );
};

export default NotFound;
