import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Img,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";
import { CodeBlock, dracula } from "@react-email/code-block";

export function DocumentExtractionConfirmed({
  parsedPayload,
  airtableRecordUrl,
  extractionTableUrl,
}: {
  parsedPayload: Record<string, unknown>;
  airtableRecordUrl: string;
  extractionTableUrl: string;
}) {
  function objectToString(obj: any) {
    let result = `{\n`;
    for (const [key, value] of Object.entries(obj)) {
      // trucate value if too long
      // check if value is a document

      let text = getTextValue(value);
      if (text.length > 100) {
        text = text.substring(0, 40) + "...";
      }
      result += `  "${key}": "${text}",\n`;
    }
    result += `}`;
    return result;
  }
  const objectAsString = objectToString(parsedPayload);

  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>
          I successfully processed your document. You can review my work.
        </Preview>
        <Body className="font-mono">
          <Container>
            <Section>
              <Text className="text-center text-4xl">AskAir</Text>
            </Section>

            <Heading className="text-xl text-center">
              Document successfully processed
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
                For the activated fields you set up, I was able provide the
                following values :
              </Text>
              <Text></Text>
            </Section>

            <Section>
              <CodeBlock
                code={objectAsString}
                lineNumbers
                language="json"
                theme={{
                  ...dracula,
                  base: {
                    ...dracula.base,
                    paddingBlock: "0em",
                    lineHeight: "0.8",
                  },
                }}
              />
            </Section>

            <Section>
              <div className="grid gap-2">
                <div>
                  <Button
                    href={airtableRecordUrl}
                    style={{
                      background: "#000",
                      color: "#fff",
                      padding: "12px 20px",
                      borderRadius: "4px",
                    }}
                  >
                    Open in airtable
                  </Button>
                </div>
                <div>
                  <Button
                    href={extractionTableUrl}
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

const getTextValue = (value: unknown): string => {
  if (!value) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  // check if we have a document object (document means multiple attachments fields)
  if (Array.isArray(value)) {
    const firstValue = value[0];
    if (
      firstValue &&
      typeof firstValue === "object" &&
      "filename" in firstValue &&
      typeof firstValue.filename === "string"
    ) {
      return `(document) ${firstValue.filename}`;
    }
  }
  return JSON.stringify(value);
};
