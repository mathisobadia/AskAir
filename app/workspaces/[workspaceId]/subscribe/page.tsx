import { Subscribe } from "@/components/client/Subscribe";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";
import WorkspaceContentLayout from "../workspace-content-layout";
import type { PageInfoProps } from "../workspace-content-layout";
const Page = async (props: {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const workspaceId = params.workspaceId;
  const success = searchParams.success;
  const canceled = searchParams.canceled;
  if (success) {
    return <Success workspaceId={workspaceId} />;
  }
  const pageInfo: PageInfoProps = {
    title: "Subscription",
    breadcrumb: [
      {
        title: "Dashboard",
        href: `/workspaces/${workspaceId}`,
      },
    ],
  };
  return (
    <WorkspaceContentLayout pageInfo={pageInfo}>
      <section>
        {canceled && <Failure />}
        <div className="flex mt-5 space-x-5">
          <Card>
            <CardHeader>
              <CardTitle>Free Plan</CardTitle>
              <CardDescription>Free forever</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>Limited to 50 free extractions</li>
                <li>Community support</li>
                <li>Pdf only documents</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button disabled variant="secondary">
                Current Plan
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pro Plan</CardTitle>
              <CardDescription>$5/month</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>Up to 1000 documents a month</li>
                <li>Dedicated support</li>
                <li>Access to beta features</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Subscribe workspaceId={workspaceId} />
            </CardFooter>
          </Card>
        </div>
      </section>
    </WorkspaceContentLayout>
  );
};

export default Page;

const Success = ({ workspaceId }: { workspaceId: string }) => {
  return (
    <section>
      <Card className="w-full max-w-sm mx-auto grid gap-4">
        <CardHeader className="flex flex-col gap-1">
          <CheckCircleIcon className="w-8 h-8 m-auto" />
          <div className="text-center">Success</div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="text-center">
            You are now subscribed to the Pro plan.
          </div>
          <Link
            className={buttonVariants({ variant: "default" })}
            href={`/workspaces/${workspaceId}`}
          >
            Go to workspace
          </Link>
        </CardContent>
      </Card>
    </section>
  );
};

const Failure = () => {
  return (
    <section className="mb-5">
      <Card className="w-full max-w-sm mx-auto grid gap-4">
        <CardHeader className="flex flex-col gap-1">
          <div className="text-center">Payment Failed</div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="text-center">
            Your payment failed please try again.
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

function CheckCircleIcon(props: { className?: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
