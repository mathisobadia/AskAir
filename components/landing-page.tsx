import AuthButton from "@/app/AuthButton";
import { auth } from "@/lib/auth";
import { ModeToggle } from "./client/toggle-theme";
import LogoText from "./logo-text";
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
    </div>
  );
}
