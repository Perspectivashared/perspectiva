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
    <section className="py-24 bg-muted/30 border-t border-border/50">
      <div className="container mx-auto px-4">
        <FadeInView>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                Communities
              </p>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
                Find your{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  research tribe
                </span>
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
                  className="group p-5 rounded-2xl border border-border/60 bg-card hover:border-primary/35 hover:shadow-elegant transition-all duration-300 block"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
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
