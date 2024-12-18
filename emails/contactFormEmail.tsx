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

export function ContactFormEmail({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}) {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>Thank you for contacting AskAir</Preview>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white p-8 rounded-lg shadow-lg">
            <Heading className="text-2xl font-bold text-center text-gray-800 mb-4">
              Contact Form Submission Confirmation
            </Heading>
            <Text className="text-gray-700 mb-4">
              Thank you for reaching out to AskAir. We have received your
              message and will get back to you as soon as possible.
            </Text>
            <Section className="bg-gray-50 p-4 rounded-md">
              <Text className="font-semibold text-gray-800">Name:</Text>
              <Text className="text-gray-700 mb-2">{name}</Text>
              <Text className="font-semibold text-gray-800">Email:</Text>
              <Text className="text-gray-700 mb-2">{email}</Text>
              <Text className="font-semibold text-gray-800">Message:</Text>
              <Text className="text-gray-700">{message}</Text>
            </Section>
            <Text className="text-sm text-gray-500 mt-8 text-center">
              This is an automated response. Please do not reply to this email.
            </Text>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
