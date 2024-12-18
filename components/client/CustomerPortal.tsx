"use client";
import { useActionState } from "react";
import { createCustomerPortal } from "@/utils/serverActions";
import { SubmitButton } from "./SubmitButton";

const initialState = {
  message: "",
};
export const CustomerPortal = ({ workspaceId }: { workspaceId: string }) => {
  const [state, formAction] = useActionState(
    createCustomerPortal,
    initialState
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="lookupKey" value="pro" />
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <SubmitButton
        variant="default"
        disabled={false}
        state={state}
        onSuccess={() => {}}
      >
        Update Billing Information
      </SubmitButton>
      {state.error && <div>{state.error}</div>}
    </form>
  );
};
