// A script to tag a release of the addon.
// It will update the version in the config.json and package.json files,
// create a new git tag, and push the changes to the remote repository.

import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { resolve } from "path";

const VERSION = process.argv[2];
const prefix = "hassio-1password-addon";

if (!VERSION) {
  console.error("Usage: node tag-release.js <version>");
  console.error("Example: node tag-release.js 0.3.0");
  process.exit(1);
}

// Validate version format (semver)
if (!/^\d+\.\d+\.\d+$/.test(VERSION)) {
  console.error(
    `Invalid version format: ${VERSION}. Expected semver format (e.g., 0.3.0)`,
  );
  process.exit(1);
}

const tag = `${prefix}/${VERSION}`;

try {
  // Update config.json
  const configPath = resolve("./config.json");
  const config = JSON.parse(readFileSync(configPath, "utf-8"));
  config.version = VERSION;
  writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
  console.log(`Updated config.json to version ${VERSION}`);

  // Update package.json
  const packagePath = resolve("./web/package.json");
  const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
  packageJson.version = VERSION;
  writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + "\n");
  console.log(`Updated web/package.json to version ${VERSION}`);

  // Stage changes
  execSync(`git add config.json web/package.json`);
  console.log("Staged changes");

  // Commit changes
  execSync(`git commit -m "Release ${tag}"`);
  console.log(`Committed release ${tag}`);

  // Create git tag
  execSync(`git tag -s ${tag} -m "Release ${tag}"`);
  console.log(`Created git tag ${tag}`);

  // Push changes and tag
  execSync(`git push`);
  execSync(`git push --tags`);
  console.log("Pushed changes and tag to remote repository");

  console.log(`\n✅ Release ${tag} tagged successfully!`);
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
}
