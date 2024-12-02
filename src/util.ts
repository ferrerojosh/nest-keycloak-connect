export const parseToken = (token: string): any => {
  const parts = token.split('.');
  return JSON.parse(Buffer.from(parts[1], 'base64').toString());
};
