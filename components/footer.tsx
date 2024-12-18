import Link from "next/link";
import { ModeToggle } from "./client/toggle-theme";
import Image from "next/image";
const Footer = () => {
  return (
    <footer className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 flex flex-col md:flex-row justify-between items-center">
          <div className="flex"></div>
          <div className="flex flex-col items-end space-y-4 md:space-y-2">
            <div className="flex items-center space-x-4">
              <Link
                href="/privacy-policy"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-use"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Terms of Use
              </Link>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} AskAir. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
