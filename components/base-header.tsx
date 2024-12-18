import AuthButton from "@/app/AuthButton";
import { ModeToggle } from "./client/toggle-theme";
import LogoText from "./logo-text";
import { auth } from "@/lib/auth";

export const Header = async () => {
  const session = await auth();

  return (
    <header className="fixed top-0 left-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
            <LogoText />
          </div>
          <nav className="hidden md:flex space-x-10"></nav>
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
