import LogoText from "@/components/logo-text";
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Font,
  Link,
  Preview,
  Row,
  Section,
  Img,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

export default function WorkspaceIsReadyEmail({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const workspaceUrl = `${process.env.SERVER_URL}/workspaces/${workspaceId}/bases`;
  return (
    <Tailwind>
      <Html>
        <Head></Head>
        <Preview>I am ready for you !</Preview>
        <Body className="font-mono">
          <Container>
            <Section>
              <Text className="text-center ">
                <div className="text-4xl">
                  <LogoText />
                </div>
              </Text>
            </Section>
            <Heading className="text-xl text-center">
              Workspace is ready
            </Heading>
            <Section>
              <Text>
                Hey,
                <br />
                it's AIR, your AI-Assistant.
              </Text>
              <Text>
                I am ready to work for you.
                <br />
                Your workspace is ready to use. I have successfully retreive
                information I needed from your Airtable bases.
              </Text>
              <Text>
                You can now pick the base, activate the fields you want me to
                extract from the documents you will send me.
                <br />
                Then I will read, extract and save the information in your
                Airtable base.
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
