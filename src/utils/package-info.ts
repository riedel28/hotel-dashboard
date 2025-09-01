import packageJson from '../../package.json';

export const getPackageVersion = (): string => {
  return packageJson.version;
};
