import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BaseCardProps {
  base: {
    id: string;
    name: string;
    updatedAt: Date;
    workspaceId: string;
  };
}

export const BaseCard = ({ base }: BaseCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{base.name}</CardTitle>
        <CardDescription>
          Last updated at {new Date(base.updatedAt).toLocaleDateString()} at{" "}
          {new Date(base.updatedAt).toLocaleTimeString()}
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex justify-end">
        <Link href={`/workspaces/${base.workspaceId}/bases/${base.id}`}>
          <Button size={"sm"}>View</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
