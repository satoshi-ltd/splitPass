const appVersion = ({ android, ios, version } = {}) => {
  if (!version) return undefined;

  const build = ios?.buildNumber ?? android?.versionCode;

  return build === undefined ? `v${version}` : `v${version} (${build})`;
};

export { appVersion };
