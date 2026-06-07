export const tabs = ["All", "Pending", "Accepted", "Rejected"];

export const statusStyles: Record<string, string> = {
  Accepted: "bg-green-50 text-green-700",
  Pending: "bg-purple-50 text-purple-700",
  Rejected: "bg-gray-100 text-gray-500",
  Cancelled: "bg-red-50 text-red-600",
};

export const statusDot: Record<string, string> = {
  Accepted: "bg-green-500",
  Pending: "bg-purple-500",
  Rejected: "bg-gray-400",
  Cancelled: "bg-red-500",
};