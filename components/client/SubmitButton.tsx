import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import RingLoader from "react-spinners/RingLoader";
import type { ActionState } from "@/utils/serverActions";
import { toast } from "sonner";

export function SubmitButton({
  onSuccess,
  state,
  children,
  size,
  disabled = true,
  variant = "secondary",
  className,
}: {
  onSuccess?: () => void;
  state: ActionState;
  children: React.ReactNode;
  size?: Parameters<typeof Button>[0]["size"];
  className?: string;
  variant?: Parameters<typeof Button>[0]["variant"];
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  const previousPending = useRef(pending);
  useEffect(() => {
    if (previousPending.current && !pending && !state.error) {
      if (onSuccess) {
        onSuccess();
      }
      toast.success(state.message);
    }
    if (previousPending.current && !pending && state.error) {
      toast.error(state.error);
    }
    previousPending.current = pending;
  });
  return (
    <Button
      aria-disabled={pending}
      type="submit"
      variant={variant}
      disabled={disabled}
      size={size || "default"}
      className={className}
    >
      {pending ? (
        <RingLoader
          loading={pending}
          size={25}
          aria-label="Loading Spinner"
          data-testid="loader"
          className="h-full"
        />
      ) : (
        <>{children}</>
      )}
    </Button>
  );
}
