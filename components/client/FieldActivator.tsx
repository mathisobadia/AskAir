"use client";
import { Switch } from "@/components/ui/switch";
import { switchAirtableFieldActivation } from "@/utils/serverActions";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AirtableTableField } from "@/db/schema";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { acceptedFieldTypesForDocumentExtraction } from "@/utils/constants";

export function FieldActivator({ field }: { field: AirtableTableField }) {
  const [checked, setChecked] = useState(field.isActivated);

  const handleChange = async (checked: boolean) => {
    setChecked(checked);
    let updatedField = await switchAirtableFieldActivation({
      id: field.id,
      isActivated: checked,
    });
    if (!updatedField) throw new Error("Failed to update field");
    setChecked(updatedField.isActivated);
    // setChecked(checked);
  };

  const allowedField = acceptedFieldTypesForDocumentExtraction.includes(
    field.fieldType
  );

  let disabled = false;
  if (!field.description || !allowedField) disabled = true;
  const disabledTooltip = !allowedField
    ? "This field type is not supported for document extraction"
    : "Add a description to activate this field";
  return (
    <div>
      <Switch
        onCheckedChange={handleChange}
        checked={checked}
        disabled={disabled}
      />
      {disabled && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="ml-2">
              <InfoCircledIcon />
            </TooltipTrigger>
            <TooltipContent>
              <p>{disabledTooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
