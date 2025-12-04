export const objectKeys = <T extends { [key: string]: unknown }>(obj: T): (keyof T)[] => {
  return Object.keys(obj);
};

export const objectEntries = <T extends { [key: string]: unknown }>(obj: T): [keyof T, T[keyof T]][] => {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
};

export const objectFromEntries = <K extends string | number, V>(entries: [K, V][]): { [key in K]: V } => {
  return Object.fromEntries(entries) as { [key in K]: V };
};
