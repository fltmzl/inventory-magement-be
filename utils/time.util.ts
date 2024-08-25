export const timestampToISOString = (timestamp: number) => {
  return new Date(timestamp).toISOString();
};
