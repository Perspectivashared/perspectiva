import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  TrendingUp,
  Briefcase,
  Dumbbell,
  Microscope,
  BookOpen,
} from "lucide-react";

const communities = [
  {
    id: "technology",
    icon: Code2,
    name: "Technology",
    members: "3.2K",
    surveys: 450,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "economics",
    icon: TrendingUp,
    name: "Economics",
    members: "2.8K",
    surveys: 380,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "business",
    icon: Briefcase,
    name: "Business",
    members: "4.1K",
    surveys: 520,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "sports-science",
    icon: Dumbbell,
    name: "Sports Science",
    members: "1.9K",
    surveys: 290,
    color: "from-orange-500 to-red-500",
  },
  {
    id: "research",
    icon: Microscope,
    name: "Research",
    members: "2.5K",
    surveys: 410,
    color: "from-indigo-500 to-violet-500",
  },
  {
    id: "education",
    icon: BookOpen,
    name: "Education",
    members: "3.7K",
    surveys: 480,
    color: "from-yellow-500 to-amber-500",
  },
];

const Communities = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Join Thriving{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Communities
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with researchers and students in your field of expertise
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => {
            const Icon = community.icon;
            return (
              <Card
                key={community.id}
                className="p-6 hover:shadow-elegant transition-all duration-300 border-border/50 bg-card/50 backdrop-blur group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${community.color} flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {community.surveys} surveys
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold mb-2">{community.name}</h3>
                <p className="text-muted-foreground text-sm">
                  {community.members} active members
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Communities;
