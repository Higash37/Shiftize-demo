export const generateTaskId = (): string => {
  return Date.now().toString();
};

export const formatTaskDescription = (description: string): string => {
  return description.trim();
};
