"use client";
import UseAnimations from "react-useanimations";
import loading2 from "react-useanimations/lib/loading2";

const StatusBadge = ({
  status,
  createdAt,
}: {
  status: "PENDING" | "FAILED" | "SUCCESS";
  createdAt: Date;
}) => {
  const colors = {
    PENDING: "bg-yellow-200 text-yellow-900",
    FAILED: "bg-red-200 text-red-900",
    SUCCESS: "bg-green-200 text-green-900",
  };
  return (
    <div
      className={`px-2 py-1 rounded-full text-xs ${
        status === "PENDING" && Date.now() - createdAt.getTime() > 5 * 60 * 1000
          ? colors["FAILED"]
          : colors[status]
      } flex items-center justify-center`}
    >
      <div>
        {status === "PENDING" &&
        Date.now() - createdAt.getTime() > 5 * 60 * 1000
          ? "FAILED"
          : status}{" "}
      </div>
      {status === "PENDING" &&
        Date.now() - createdAt.getTime() <= 5 * 60 * 1000 && (
          <UseAnimations animation={loading2} size={20} />
        )}
    </div>
  );
};
export default StatusBadge;
