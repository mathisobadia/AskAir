import AuthButton from "@/app/AuthButton";
import { auth } from "@/lib/auth";
import { ModeToggle } from "./client/toggle-theme";
import LogoText from "./logo-text";
import { ContactForm } from "@/components/client/ContactForm";
import { db } from "@/db";
import { Extraction, ExtractionKeyValue } from "@/db/schema";
import { count } from "drizzle-orm";
import { TableIcon, MagicWandIcon } from "@radix-ui/react-icons";
const Header = async () => {
  const session = await auth();

  return (
    <header className="fixed top-0 left-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
            <LogoText />
          </div>
          <nav className="hidden md:flex space-x-10">
            <a
              href="#features"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Pricing
            </a>
            <a
              href="#contact"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Contact
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            <div className="">
              <ModeToggle />
            </div>
            <AuthButton serverSession={session} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default async function LandingPage() {
  const session = await auth();

  const [extractionCount] = await db
    .select({ count: count() })
    .from(Extraction);
  const [keyValueCount] = await db
    .select({ count: count() })
    .from(ExtractionKeyValue);
  console.log(extractionCount, keyValueCount);
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center h-[calc(100vh-100px)] bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 animate-gradient-x">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white">
              <span className="block">Revolutionize Your</span>
              <span className="block text-blue-200">Airtable Data Entry</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base sm:text-lg md:mt-5 md:text-xl text-gray-100">
              Automatically extract document data into Airtable entries with
              AI-powered automation. Save time and eliminate manual data entry.
            </p>
            <div className="mt-10 sm:flex sm:justify-center">
              <AuthButton
                serverSession={session}
                className="text-xl px-8 py-4 bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300"
              />
            </div>
          </div>
        </div>
      </main>

      <section id="how-it-works" className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
              How It Works
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Get Started with AskAir in 3 Simple Steps
            </p>
          </div>
          <div className="mt-16">
            <ol className="space-y-16">
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white text-xl font-bold">
                    1
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl leading-6 font-bold text-gray-900 dark:text-white mb-2">
                    Set Up Your Airtable
                  </h3>
                  <p className="text-lg text-gray-500 dark:text-gray-400">
                    Create your table with all the necessary columns. Add
                    detailed descriptions directly inside Airtable to each
                    column to guide the AI in understanding your data structure.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white text-xl font-bold">
                    2
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl leading-6 font-bold text-gray-900 dark:text-white mb-2">
                    Connect AskAir
                  </h3>
                  <p className="text-lg text-gray-500 dark:text-gray-400">
                    Link AskAir to your Airtable. You'll receive a unique email
                    address for the extractor, which will be used to process
                    your documents.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white text-xl font-bold">
                    3
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl leading-6 font-bold text-gray-900 dark:text-white mb-2">
                    Send and Extract
                  </h3>
                  <p className="text-lg text-gray-500 dark:text-gray-400">
                    Simply email your document to the extractor address. AskAir
                    will automatically parse the document and fill a new
                    Airtable record with the extracted information. You can also
                    submit documents directly via the web app.
                  </p>
                </div>
              </li>
            </ol>
          </div>
          <div className="mt-12 flex justify-center">
            <AuthButton
              serverSession={session}
              className="text-xl px-8 py-4 bg-white text-blue-700 hover:bg-blue-50 transition-colors duration-300"
            />
          </div>
        </div>
      </section>

      <section id="features" className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              A better way to handle your data
            </p>
          </div>
          <div className="mt-16">
            <dl className="space-y-16 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-12 md:gap-y-16">
              <div className="flex flex-col items-start">
                <div className="flex-shrink-0 mb-6">
                  <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-500 text-white">
                    <MagicWandIcon className="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <dt className="text-xl leading-6 font-bold text-gray-900 dark:text-white mb-4">
                    AI-Powered Data Entry
                  </dt>
                  <dd className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                    Let our AI handle your data entry tasks with high accuracy
                    and speed. Save time and reduce errors in your workflow.
                  </dd>
                </div>
              </div>
              <div className="flex flex-col items-start">
                <div className="flex-shrink-0 mb-6">
                  <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-500 text-white">
                    <TableIcon className="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <dt className="text-xl leading-6 font-bold text-gray-900 dark:text-white mb-4">
                    Seamless Airtable Integration
                  </dt>
                  <dd className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                    Works directly with your Airtable setup, no complex
                    configurations needed. Enhance your existing workflows
                    effortlessly.
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="py-40 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
              Powering Data Extraction at Scale
            </h2>
            <p className="mt-4 text-xl text-blue-100">
              See the real-time impact of AskAir in numbers
            </p>
            <p className="mt-2 text-xl font-semibold text-blue-100 bg-blue-800/30 py-2 px-4 rounded-lg inline-block">
              These statistics are live and reflect actual usage data from our
              application
            </p>
          </div>
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-lg overflow-hidden p-8">
              <dl className="flex flex-col items-center">
                <dd className="text-7xl font-bold text-white mb-4">
                  {extractionCount?.count.toLocaleString()}
                </dd>
                <dt className="text-xl font-medium text-blue-100 mb-2">
                  Total Extractions
                </dt>
                <div className="text-sm text-blue-200 text-center">
                  Documents processed by our AI
                </div>
              </dl>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-lg overflow-hidden p-8">
              <dl className="flex flex-col items-center">
                <dd className="text-7xl font-bold text-white mb-4">
                  {keyValueCount?.count.toLocaleString()}
                </dd>
                <dt className="text-xl font-medium text-blue-100 mb-2">
                  Key-Value Pairs
                </dt>
                <div className="text-sm text-blue-200 text-center">
                  Fields extracted from documents
                </div>
              </dl>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-lg overflow-hidden p-8">
              <dl className="flex flex-col items-center">
                <dd className="text-7xl font-bold text-white mb-4">
                  {Math.floor(((keyValueCount?.count || 0) * 10) / 3600)}
                </dd>
                <dt className="text-xl font-medium text-blue-100 mb-2">
                  Hours Saved
                </dt>
                <div className="text-sm text-blue-200 text-center">
                  Based on 10 seconds per manual extraction
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-foreground sm:text-5xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-xl text-muted-foreground">
              Choose the plan that's right for your business
            </p>
          </div>
          <div className="text-center mb-12 bg-secondary p-8 rounded-lg shadow-lg">
            <span className="inline-block bg-primary text-primary-foreground text-lg font-bold py-2 px-4 rounded-full animate-bounce">
              🎉 Exciting News! 🎉
            </span>
            <p className="mt-4 text-2xl font-semibold text-secondary-foreground">
              For a limited time, AskAir is 100% FREE for all users!
            </p>
            <p className="mt-2 text-lg text-secondary-foreground/80">
              Enjoy full access to all features while we're in beta. Future
              pricing below:
            </p>
            <div className="mt-8">
              <AuthButton serverSession={session} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Starter Plan */}
            <div className="flex flex-col bg-card rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-8 sm:p-10 sm:pb-6">
                <h3 className="text-2xl font-semibold text-card-foreground">
                  Starter
                </h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold text-primary">
                    $29
                  </span>
                  <span className="ml-1 text-xl font-semibold text-muted-foreground">
                    /month
                  </span>
                </div>
                <p className="mt-5 text-lg text-muted-foreground">
                  Perfect for small teams and startups.
                </p>
              </div>
              <div className="flex-1 px-6 pt-6 pb-8 sm:px-10 sm:pt-6 bg-card">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <svg
                      className="flex-shrink-0 h-6 w-6 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="ml-3 text-base text-card-foreground">
                      Up to 1,000 extractions/month
                    </p>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="flex-shrink-0 h-6 w-6 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="ml-3 text-base text-card-foreground">
                      Basic AI model
                    </p>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="flex-shrink-0 h-6 w-6 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="ml-3 text-base text-card-foreground">
                      Email support
                    </p>
                  </li>
                </ul>
                <div className="mt-8">
                  <a
                    href="#"
                    className="block w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-semibold text-center hover:bg-primary/90"
                  >
                    Get Started for Free
                  </a>
                </div>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="flex flex-col bg-card rounded-lg shadow-lg overflow-hidden border-2 border-primary">
              <div className="px-6 py-8 sm:p-10 sm:pb-6">
                <h3 className="text-2xl font-semibold text-card-foreground">
                  Pro
                </h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold text-primary">
                    $99
                  </span>
                  <span className="ml-1 text-xl font-semibold text-muted-foreground">
                    /month
                  </span>
                </div>
                <p className="mt-5 text-lg text-muted-foreground">
                  For growing businesses with higher volume needs.
                </p>
              </div>
              <div className="flex-1 px-6 pt-6 pb-8 sm:px-10 sm:pt-6 bg-card">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <svg
                      className="flex-shrink-0 h-6 w-6 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="ml-3 text-base text-card-foreground">
                      Up to 10,000 extractions/month
                    </p>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="flex-shrink-0 h-6 w-6 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="ml-3 text-base text-card-foreground">
                      Advanced AI model
                    </p>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="flex-shrink-0 h-6 w-6 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="ml-3 text-base text-card-foreground">
                      Priority email & chat support
                    </p>
                  </li>
                </ul>
                <div className="mt-8">
                  <a
                    href="#"
                    className="block w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-semibold text-center hover:bg-primary/90"
                  >
                    Get Started for Free
                  </a>
                </div>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="flex flex-col bg-card rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-8 sm:p-10 sm:pb-6">
                <h3 className="text-2xl font-semibold text-card-foreground">
                  Enterprise
                </h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold text-primary">
                    Custom
                  </span>
                </div>
                <p className="mt-5 text-lg text-muted-foreground">
                  For large-scale operations with custom needs.
                </p>
              </div>
              <div className="flex-1 px-6 pt-6 pb-8 sm:px-10 sm:pt-6 bg-card">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <svg
                      className="flex-shrink-0 h-6 w-6 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="ml-3 text-base text-card-foreground">
                      Self host askair so that your data does not leave your
                      cloud provider
                    </p>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="flex-shrink-0 h-6 w-6 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="ml-3 text-base text-card-foreground">
                      Unlimited extractions
                    </p>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="flex-shrink-0 h-6 w-6 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="ml-3 text-base text-card-foreground">
                      Custom AI model training
                    </p>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="flex-shrink-0 h-6 w-6 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="ml-3 text-base text-card-foreground">
                      24/7 phone & email support
                    </p>
                  </li>
                </ul>
                <div className="mt-8">
                  <a
                    href="#"
                    className="block w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-semibold text-center hover:bg-primary/90"
                  >
                    Contact Sales
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card shadow-lg rounded-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
            <div className="p-8 relative z-10">
              <h2 className="text-3xl font-extrabold text-card-foreground text-center mb-6">
                Get in Touch
              </h2>
              <p className="text-lg text-muted-foreground text-center mb-8">
                Have questions or want to know more? We're here to help!
              </p>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
