"use client";

import { postDocuments } from "@/utils/serverActions";
import { Input } from "../ui/input";
import { useState, useActionState } from "react";
import { Alert } from "../ui/alert";
import {
  MAX_NUMBER_OF_FILES,
  allowedDocumentFileContentTypes,
  allowedDocumentFileTypes,
  allowedImageFileContentTypes,
} from "@/utils/constants";
import { SubmitButton } from "./SubmitButton";
import { toast } from "sonner";
import Gradient from "../gradient";

const initialState = {
  message: "",
};

const MAX_TOTAL_SIZE_MB = 10;
const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;

export const PostDocumentForm = ({ tableId }: { tableId: string }) => {
  const [state, formAction] = useActionState(postDocuments, initialState);
  const [numberOfFiles, setNumberOfFiles] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [disabled, setDisabled] = useState(true);

  return (
    <div className="">
      <div className="mb-2">
        <h2 className="text-base">Upload file</h2>
        <div className="text-xs text-muted-foreground">
          Upload files to your <Gradient>AirAssistant</Gradient>, it will
          extract activated fields and create a record in your table.
        </div>
      </div>
      <form action={formAction} className="space-y-2">
        <div className="flex gap-1">
          <div className="flex-1">
            <Input
              type="text"
              name="userInstruction"
              placeholder="Add a message to your assistant"
            />
          </div>
          <div className="flex-1">
            <Input
              multiple
              accept={[
                ...allowedDocumentFileContentTypes,
                ...allowedDocumentFileTypes,
                ...allowedImageFileContentTypes,
              ].join(",")}
              type="file"
              name="files"
              onChange={(e) => {
                const files = e?.target?.files;
                const filesCount = files?.length || 0;
                setNumberOfFiles(filesCount);

                let size = 0;
                if (files) {
                  for (let i = 0; i < files.length; i++) {
                    size += files[i]?.size || 0;
                  }
                }
                setTotalSize(size);
                setDisabled(filesCount === 0 || size > MAX_TOTAL_SIZE_BYTES);
              }}
            />
          </div>
          <input
            type="text"
            hidden={true}
            name="tableId"
            defaultValue={tableId}
          />
          <SubmitButton
            state={state}
            disabled={disabled}
            onSuccess={() => toast.success("Documents uploaded")}
          >
            Submit
          </SubmitButton>
        </div>
        <AlertFiles numberOfFiles={numberOfFiles} totalSize={totalSize} />
      </form>
    </div>
  );
};

const AlertFiles = ({
  numberOfFiles,
  totalSize,
}: {
  numberOfFiles: number;
  totalSize: number;
}) => {
  if (numberOfFiles >= MAX_NUMBER_OF_FILES) {
    return (
      <Alert variant="destructive">
        You cannot upload more than 20 files at once
      </Alert>
    );
  }
  if (totalSize > MAX_TOTAL_SIZE_BYTES) {
    return (
      <Alert variant="destructive">
        Total file size cannot exceed {MAX_TOTAL_SIZE_MB}MB
      </Alert>
    );
  }
  return null;
};
