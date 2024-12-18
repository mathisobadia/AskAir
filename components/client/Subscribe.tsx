"use client";
import { useActionState } from "react";
import { createCheckoutSession } from "@/utils/serverActions";
import { SubmitButton } from "./SubmitButton";

const initialState = {
  message: "",
};
export const Subscribe = ({ workspaceId }: { workspaceId: string }) => {
  const [state, formAction] = useActionState(
    createCheckoutSession,
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
        Subscribe
      </SubmitButton>
      {state.error && <div>{state.error}</div>}
    </form>
  );
};
