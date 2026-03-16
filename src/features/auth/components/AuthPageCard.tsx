import { type ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface AuthPageCardProps {
  title: string;
  children: ReactNode;
}

const AuthPageCard = ({ title, children }: AuthPageCardProps) => (
  <Card className="mt-24 p-6 shadow-lg">
    <h1 className="mb-6 text-center text-4xl font-bold">
      <span className="bg-gradient-primary bg-clip-text text-transparent">
        {title}
      </span>
    </h1>

    {children}
  </Card>
);

export default AuthPageCard;
