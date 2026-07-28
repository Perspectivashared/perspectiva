import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/routes";
import { ALL_COMMUNITIES, sortCommunities } from "@/features/communities/domain/community-data";
import FadeInView from "@/components/FadeInView";

const formatCount = (n: number) =>
  new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);

const TOP_COMMUNITIES = sortCommunities(ALL_COMMUNITIES, "mostActive").slice(0, 6);

const Communities = () => {
  return (
    <section className="relative py-24">
      <div className="container mx-auto px-4">
        <FadeInView>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-[hsl(var(--eyebrow-fg))]">
                Communities
              </p>
              <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
                Find your <span className="text-primary">research tribe</span>
              </h2>
            </div>
            <Button asChild variant="outline" size="sm" className="w-fit">
              <Link to={ROUTES.communities}>View all communities →</Link>
            </Button>
          </div>
        </FadeInView>

        <FadeInView delay={0.1}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOP_COMMUNITIES.map((community) => {
              const Icon = community.icon;
              return (
                <Link
                  key={community.id}
                  to={`${ROUTES.communities}/${community.id}`}
                  className="glass-panel group block rounded-2xl p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">
                      {community.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{formatCount(community.members)} members</span>
                    <span>{community.surveys} surveys</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </FadeInView>
      </div>
    </section>
  );
};

export default Communities;
