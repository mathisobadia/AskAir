"use client";
import { CheckIcon, Pencil1Icon, CopyIcon } from "@radix-ui/react-icons";
import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type ActionState, updateEmailSettings } from "@/utils/serverActions";
import { SubmitButton } from "@/components/client/SubmitButton";
import { toast } from "sonner";
import type { AirtableTable } from "@/db/schema";

const initialState: ActionState = {
  message: undefined,
  error: undefined,
};

export const EmailSettings = ({ table }: { table: AirtableTable }) => {
  const [editEmailKey, setEditEmailKey] = useState(false);
  const [state, formAction] = useActionState(updateEmailSettings, initialState);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    navigator.clipboard.writeText(`${table.emailKey}@extractor.askair.ai`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="mb-2">
        <h2 className="text-base">By email</h2>
        <div className="text-xs text-muted-foreground">
          Send your document to your AirAssistant, it will extract activated
          fields and create a record in your table.
        </div>
      </div>
      <div className="flex">
        {editEmailKey ? (
          <div>
            <form action={formAction}>
              <div className="flex justify-center items-center">
                <Input
                  name="emailKey"
                  type="text"
                  defaultValue={table.emailKey}
                ></Input>
                <div className="align-middle mr-2">@extractor.askair.ai</div>
                <input
                  type="text"
                  hidden={true}
                  name="workspaceId"
                  defaultValue={table.workspaceId}
                ></input>
                <input
                  type="text"
                  hidden={true}
                  name="tableId"
                  defaultValue={table.id}
                ></input>
                <input
                  type="text"
                  hidden={true}
                  name="baseId"
                  defaultValue={table.baseId}
                ></input>
                <SubmitButton
                  disabled={false}
                  state={state}
                  onSuccess={() => setEditEmailKey(false)}
                >
                  <div className="flex gap-1 items-center">
                    <CheckIcon />
                    Save
                  </div>
                </SubmitButton>
                {state.error && toast.error(state.error)}
              </div>
            </form>
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="relative rounded-md bg-muted px-2 py-2 font-mono text-sm border">
              {/* flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 */}
              {`${table.emailKey}@extractor.askair.ai`}
            </div>
            <Button variant={"outline"} onClick={(e) => setEditEmailKey(true)}>
              <Pencil1Icon></Pencil1Icon>
            </Button>

            <Button variant={"outline"} onClick={handleCopy}>
              <div className="flex items-center gap-1">
                <CopyIcon></CopyIcon>
                {copied ? "Copied!" : "Copy"}
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
