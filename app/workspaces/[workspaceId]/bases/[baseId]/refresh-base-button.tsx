"use client";

import { Button } from "@/components/ui/button";
import { UpdateIcon, ReloadIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { toast } from "sonner";
import { refreshBaseFields } from "@/utils/serverActions";
export default function RefreshBaseFieldsButton({
  baseId,
}: {
  baseId: string;
}) {
  let [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      // wait 5 seconds
      await refreshBaseFields({ baseId });
      toast.success("Fields refreshed");
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="secondary" onClick={handleClick}>
      <div className="flex gap-2">
        {loading ? (
          <>
            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </>
        ) : (
          <>
            <div>Refresh fields</div>
            <UpdateIcon className="w-5 h-5" />
          </>
        )}
      </div>
    </Button>
  );
}
