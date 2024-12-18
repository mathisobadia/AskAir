import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ModeToggle } from "@/components/client/toggle-theme";
import Image from "next/image";
import type { Menu } from "./layout";
import { MenuItem } from "./menu-item";
import { AirtableConnectButton } from "@/components/client/AirtableConnectButton";
import HeaderProfileMenu from "./header-profile";
import LogoText from "@/components/logo-text";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User } from "next-auth";

type workspaceKeyValue = {
  name: string;
  id: string;
};
export default function Header({
  workspaceId,
  workspaces,
  className,
  menu,
  user,
}: {
  workspaceId: string;
  workspaces: workspaceKeyValue[];
  className?: string;
  menu: Menu;
  user: User;
}) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between h-full">
        <div className="md:hidden cursor-pointer">
          <Sheet>
            <SheetTrigger>
              <HamburgerMenuIcon />
            </SheetTrigger>
            <SheetContent side={"left"}>
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>
                  <p>
                    <div className="pt-4">
                      {menu.map((item) => (
                        <div key={item.href}>
                          <MenuItem target={item.href}>{item.name}</MenuItem>
                          {item.subItems && (
                            <div className="ml-4 text-xs">
                              {item.subItems.map((subItem, j) => (
                                <MenuItem
                                  key={subItem.href}
                                  target={subItem.href}
                                >
                                  {subItem.name}
                                </MenuItem>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <AirtableConnectButton workspaceId={workspaceId} />
                  </p>
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center gap-2">
          <h1 className="text-2xl tracking-wide flex items-center">
            <div className="relative">
              <Image
                src="/askair-logo.png"
                alt="AskAir Logo"
                width={100}
                height={100}
                className="h-10 w-10"
              />
            </div>

            <div>
              <LogoText />
            </div>
          </h1>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex gap-2">
            <Link
              href={
                "https://airtable.com/appPEnpsNR6h3UT5z/shrfZJGAObAlc7uNB/tblY55qgi1sdsBqDY"
              }
              target="_blank"
            >
              <Button variant={"link"} size={"sm"}>
                Dev roadmap
              </Button>
            </Link>
            <Link
              href={
                "https://airtable.com/appPEnpsNR6h3UT5z/pagcMZL8X1pP2TEKG/form"
              }
              target="_blank"
            >
              <Button variant={"link"} size={"sm"}>
                Send a feedback
              </Button>
            </Link>
          </div>
          <ModeToggle />
          <HeaderProfileMenu user={user} />
        </div>
      </div>
    </div>
  );
}
