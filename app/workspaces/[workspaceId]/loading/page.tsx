"use client";
import { motion } from "framer-motion";
import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ServerResponse = {
  message: string;
  success: boolean;
};
export default function LoadingPage(props: {
  params: Promise<{ workspaceId: string }>;
}) {
  const params = use(props.params);
  const text = "You will soon be able to ask AIR anything you need";
  const router = useRouter();

  const refreshWorkspace = async () => {
    console.log("refreshing workspace", params.workspaceId);
    let response = await fetch(`/api/workspaces/${params.workspaceId}`, {
      method: "POST",
    });
    console.log("response", response);
    if (response.status === 200) {
      let data = (await response.json()) as ServerResponse;
      console.log("data", data);
      if (data.success) {
        return router.push(`/workspaces/${params.workspaceId}`);
      } else {
        toast.error("Failed to connect to airtable. Redirecting...");
        router.push(`/workspaces/${params.workspaceId}`);
      }
    } else {
      // show toast but still try to go to the workspace
      toast.error("Failed to connect to airtable. Redirecting...");
      router.push(`/workspaces/${params.workspaceId}`);
    }
  };

  useEffect(() => {
    refreshWorkspace();
  });

  return (
    <div className=" bg-background flex justify-center items-center z-10 h-screen w-screen fixed top-0 left-0">
      <div className="flex flex-col items-center ">
        <h1 className="text-xl">
          <span>Workspace is loading</span>
        </h1>

        <motion.div>
          {text.split("").map((char, index) => {
            return (
              <motion.span
                key={index}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  repeat: Infinity,
                  repeatType: "reverse",
                  repeatDelay: 1,
                }}
              >
                {char}
              </motion.span>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
