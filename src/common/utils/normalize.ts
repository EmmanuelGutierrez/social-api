export const normalize = (query: string) => {
  return query.toLowerCase().trim().replace(/\s+/g, '');
};
