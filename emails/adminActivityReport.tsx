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

interface ActivityReportProps {
  totalExtractions: number;
  uniqueWorkspaceNames: string[];
  extractions: Array<{
    extraction: any;
    workspaceName: string | null;
    totalKeyValues: number;
    nonEmptyKeyValues: number;
  }>;
  tokenCount: {
    input: number;
    output: number;
  };
}

export function AdminActivityReport({
  totalExtractions,
  uniqueWorkspaceNames,
  extractions,
  tokenCount,
}: ActivityReportProps) {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>Daily Activity Report</Preview>
        <Body className="font-mono">
          <Container>
            <Section>
              <Text className="text-center text-4xl">AskAir</Text>
            </Section>

            <Heading className="text-xl text-center">
              Daily Activity Report
            </Heading>

            <Section className="my-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <Text className="text-lg font-bold">Summary</Text>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text className="text-sm text-gray-600">
                      Total Extractions
                    </Text>
                    <Text className="text-xl font-bold">
                      {totalExtractions}
                    </Text>
                  </div>
                  <div>
                    <Text className="text-sm text-gray-600">
                      Active Workspaces
                    </Text>
                    <Text className="text-xl font-bold">
                      {uniqueWorkspaceNames.length}
                    </Text>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text className="text-sm text-gray-600">
                      Total Input Tokens
                    </Text>
                    <Text className="text-xl font-bold">
                      {tokenCount.input}
                    </Text>
                  </div>
                  <div>
                    <Text className="text-sm text-gray-600">
                      Total Output Tokens
                    </Text>
                    <Text className="text-xl font-bold">
                      {tokenCount.output}
                    </Text>
                  </div>
                </div>
              </div>
            </Section>

            <Section>
              <Text className="text-lg font-bold mb-2">Extraction Details</Text>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">
                      Workspace
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Status
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Input Tokens
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Output Tokens
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Key Values
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {extractions.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2">
                        {item.workspaceName || "Unknown"}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {item.extraction.status}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {item.extraction.inputTokenCount}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {item.extraction.outputTokenCount}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {item.nonEmptyKeyValues} / {item.totalKeyValues}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
