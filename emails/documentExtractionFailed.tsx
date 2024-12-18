import {
  Body,
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

export function DocumentExtractionFailed({
  error = "Unkwnown error",
}: {
  error: string;
}) {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>Error while proccessing the document</Preview>
        <Body className="font-mono">
          <Container>
            <Section>
              <Text className="text-center text-4xl">AskAir</Text>
            </Section>

            <Heading className="text-xl text-center">
              Error while proccessing the document
            </Heading>
            <Section>
              <Text>
                Hey,
                <br />
                it's AIR, your AI-Assistant.
              </Text>
              <Text>
                You asked me to read and process a document.
                <br />
                There was an error while processing the document: {error}
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
