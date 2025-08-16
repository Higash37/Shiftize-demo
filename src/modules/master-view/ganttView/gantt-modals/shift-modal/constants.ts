export const generateTimeOptions = () => {
  const options: string[] = [];
  for (let hour = 9; hour <= 22; hour++) {
    options.push(`${hour.toString().padStart(2, "0")}:00`);
    options.push(`${hour.toString().padStart(2, "0")}:15`);
    options.push(`${hour.toString().padStart(2, "0")}:30`);
    options.push(`${hour.toString().padStart(2, "0")}:45`);
  }
  return options;
};

export const statusOptions = [
  { label: "承認済み", value: "approved" },
  { label: "申請中", value: "pending" },
  { label: "下書き", value: "draft" },
  { label: "却下", value: "rejected" },
];