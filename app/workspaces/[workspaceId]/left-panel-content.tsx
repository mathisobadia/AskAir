import { db } from "@/db";
import { AirtableConnectButton } from "@/components/client/AirtableConnectButton";
import { MenuItem } from "./menu-item";
import type { Menu } from "./layout";
import SelectWorkspace from "@/components/client/select-workspace";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateWorkspaceForm from "@/components/forms/workspace/workspace-create";
import { eq } from "drizzle-orm";
import { Subscription, Workspace } from "@/db/schema";

export default function LeftPanelContent({
  workspace,
  menu,
  workspaces,
  userId,
}: {
  workspace: Workspace & { subscription: Subscription | null };
  menu: Menu;
  workspaces: { name: string; id: string }[];
  userId: string;
}) {
  if (!workspace) return null;
  const workspaceId = workspace.id;
  const userSubscribed = workspace.subscription?.status === "active";

  return (
    <div className="">
      <div className="my-2">
        <div className="flex gap-2">
          <SelectWorkspace
            workspaces={workspaces}
            currentWorkspaceId={workspaceId}
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new workspace</DialogTitle>
                <DialogDescription>
                  <>
                    <p>
                      Workspaces are where you can organize your projects and
                      collaborate with your team.
                    </p>
                    <div className="mt-6">
                      <CreateWorkspaceForm userId={userId} />
                    </div>
                  </>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {menu.map((item) => (
        <div key={item.href}>
          <MenuItem target={item.href}>
            <div className="flex gap-2 justify-center items-center">
              {item.icon && <item.icon className="w-4 h-4" />}
              {item.name}
            </div>
          </MenuItem>
          {item.subItems && (
            <div className="ml-4 text-xs border-l">
              {item.subItems.map((subItem) => (
                <MenuItem key={subItem.href} target={subItem.href}>
                  {subItem.name}
                </MenuItem>
              ))}
            </div>
          )}
        </div>
      ))}

      <AirtableConnectButton workspaceId={workspace.id} />
    </div>
  );
}
