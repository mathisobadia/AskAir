"use client";
import { motion } from "framer-motion";

export default function LoadingState() {
  return (
    <div>
      <div className="flex flex-col items-center ">
        <h1 className="text-xl">
          <span>Let me load</span>
          <motion.span>
            {"...".split("").map((char, index) => {
              return (
                <motion.span
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 1, repeat: Infinity }}
                >
                  {char}
                </motion.span>
              );
            })}
          </motion.span>
        </h1>
      </div>
    </div>
  );
}
