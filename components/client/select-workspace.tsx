"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

export default function SelectWorkspace({
  workspaces,
  currentWorkspaceId,
}: {
  workspaces: { name: string; id: string }[];
  currentWorkspaceId: string;
}) {
  const router = useRouter();
  const currentWorkspaceName = workspaces.find(
    (w) => w.id === currentWorkspaceId
  )?.name;
  return (
    <Select
      value={currentWorkspaceId}
      onValueChange={(value) => {
        router.push(`/workspaces/${value}`);
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={currentWorkspaceName} />
      </SelectTrigger>
      <SelectContent className="">
        {workspaces.map((workspace) => (
          <SelectItem key={workspace.id} value={workspace.id}>
            {workspace.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
