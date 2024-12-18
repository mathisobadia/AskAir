import LogoText from "@/components/logo-text";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

export default function InviteToWorkspaceEmail({
  workspaceId,
  workspaceName,
}: {
  workspaceId: string;
  workspaceName: string;
}) {
  const workspaceUrl = `${process.env.SERVER_URL}/workspaces/${workspaceId}/bases`;
  return (
    <Tailwind>
      <Html>
        <Head></Head>
        <Preview>You have been added to a workspace!</Preview>
        <Body className="font-mono">
          <Container>
            <Section className="flex justify-center">
              <div className="text-4xl">
                <LogoText />
              </div>
            </Section>
            <Heading className="text-xl text-center">
              Welcome to {workspaceName}
            </Heading>
            <Section>
              <Text>
                Hey,
                <br />
                it's AIR, your AI-Assistant.
              </Text>
              <Text>
                You have been added to the workspace "{workspaceName}".
                <br />
                You can now collaborate with your team and manage your projects
                efficiently.
              </Text>
              <Text>
                Click the button below to access your workspace and get started.
              </Text>
            </Section>

            <Section>
              <div className="grid gap-2">
                <div>
                  <Button
                    href={workspaceUrl}
                    style={{
                      background: "#000",
                      color: "#fff",
                      padding: "12px 20px",
                      borderRadius: "4px",
                    }}
                  >
                    View in AskAir
                  </Button>
                </div>
              </div>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
