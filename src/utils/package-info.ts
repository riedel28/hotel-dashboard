// Utility to get package.json information
export const getPackageVersion = (): string => {
  // In a Vite environment, we can import package.json directly
  // This will be replaced with the actual version at build time
  return import.meta.env.VITE_APP_VERSION || '0.0.0';
};
