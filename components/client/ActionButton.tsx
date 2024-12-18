"use client";

import { useState } from "react";
import RingLoader from "react-spinners/RingLoader";
import { toast } from "sonner";
import type { CSSProperties } from "react";
import { Button } from "../ui/button";

type ActionButtonProps = {
  label: string;
  clickAction: () => Promise<void>;
  successMessage?: string;

  size?: "default" | "sm" | "lg" | "icon";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
};

export const ActionButton = ({
  label,
  clickAction,
  variant = "secondary", // Default to 'secondary' if not provided
  className = "",
  successMessage = "Action successful",
  size = "default",
}: ActionButtonProps) => {
  let [loading, setLoading] = useState(false);
  const override: CSSProperties = {
    display: "block",
    height: "100%",
  };

  const handleClick = async () => {
    setLoading(true);
    try {
      await clickAction();
      toast.success(successMessage);
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant={variant}
        className={`relative min-w-min ${className}`}
        onClick={handleClick}
        size={size}
      >
        {loading ? (
          <RingLoader
            loading={loading}
            size={25}
            aria-label="Loading Spinner"
            data-testid="loader"
            className="h-full"
          />
        ) : (
          label
        )}
      </Button>
    </div>
  );
};
