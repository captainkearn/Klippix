export function formatReleaseLabel(version) {
  const betaMatch = /^0\.(\d+)\.0-beta\.\d+$/.exec(version);
  if (betaMatch) return `.${betaMatch[1]} BETA`;
  if (version === "development") return "Development build";
  return `v${version}`;
}

const packageVersion = import.meta.env?.KLIPPIX_VERSION ?? "development";

export const releaseLabel = formatReleaseLabel(packageVersion);
