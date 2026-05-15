export type Applicant = {
  id: string;
  name: string;
  avatar: string;
  appliedDate: string;
  level: "Junior" | "Mid-Level" | "Senior";
  program: string;
  status: "Accepted" | "Pending" | "Cancelled";
};