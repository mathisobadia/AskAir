"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useState } from "react";
import { switchAirtableFieldDocumentTarget } from "@/utils/serverActions";
import type { AirtableTableField } from "@/db/schema";

export const DocumentFieldSelect = ({
  fields,
}: {
  fields: AirtableTableField[];
}) => {
  const handleChange = async (fieldId: string) => {
    for (let field of fields) {
      if (field.id === fieldId) {
        let updatedField = await switchAirtableFieldDocumentTarget({
          id: field.id,
          isDocumentTargetField: true,
        });
      } else if (field.isDocumentTargetField) {
        let updatedField = await switchAirtableFieldDocumentTarget({
          id: field.id,
          isDocumentTargetField: false,
        });
      }
    }
    setSelectedFieldId(fieldId);
  };
  const selectedField = fields.find((f) => f.isDocumentTargetField);
  const [selectedFieldId, setSelectedFieldId] = useState(selectedField?.id);
  if (!fields || fields.length === 0) return <AlertNoDocumentFieldFound />;
  return (
    <Select onValueChange={handleChange}>
      <SelectTrigger className="w-[250px]">
        <SelectValue
          placeholder={selectedField?.fieldName || "Select Document Field"}
        />
      </SelectTrigger>
      <SelectContent>
        {fields.map((field) => {
          return (
            <SelectItem key={field.id} value={field.id}>
              {field.fieldName}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

const AlertNoDocumentFieldFound = () => (
  <Alert>
    <AlertTitle>Warning</AlertTitle>
    <AlertDescription>
      No Field with type Attachment in this table, create a new attachment field
      to automatically add the document to the table when extracting
    </AlertDescription>
  </Alert>
);
