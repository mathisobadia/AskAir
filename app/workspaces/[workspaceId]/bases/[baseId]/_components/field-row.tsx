"use client";

import { FieldActivator } from "@/components/client/FieldActivator";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { CheckIcon, Cross1Icon, Pencil1Icon } from "@radix-ui/react-icons";
import { AirtableTableField } from "@/db/schema";
import { Textarea } from "@/components/ui/textarea";
import { ActionState, updateFieldDescription } from "@/utils/serverActions";
import { SubmitButton } from "@/components/client/SubmitButton";

const initialState: ActionState = {
  message: "",
  error: "",
};

export const FieldRow = ({
  field,
  baseId,
}: {
  field: AirtableTableField;
  baseId: string;
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [description, setDescription] = useState<string>(
    field.description || ""
  );
  const [state, formAction] = useActionState(
    updateFieldDescription,
    initialState
  );

  const handleCancel = () => {
    setDescription(field.description || "");
    setIsEditing(false);
  };

  return (
    <TableRow key={field.id}>
      <TableCell className="font-medium">{field.fieldName}</TableCell>
      <TableCell>{field.fieldType}</TableCell>
      <TableCell className="flex items-center gap-2 w-full">
        {isEditing ? (
          <form action={formAction} className="flex items-center gap-2 w-full">
            <input type="hidden" name="fieldId" value={field.id} />
            <input type="hidden" name="description" value={description} />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <SubmitButton
              state={state}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onSuccess={() => {
                setIsEditing(false);
              }}
              disabled={description.length === 0}
            >
              <CheckIcon className="h-4 w-4" />
            </SubmitButton>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCancel}
            >
              <Cross1Icon className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <div className="w-full flex items-end justify-between">
            <span className="w-full">{description}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsEditing(true)}
            >
              <Pencil1Icon className="h-3 w-3" />
            </Button>
          </div>
        )}
      </TableCell>
      <TableCell className="text-right">
        <FieldActivator field={field} />
      </TableCell>
    </TableRow>
  );
};
