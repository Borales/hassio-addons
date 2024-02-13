import { glob } from 'glob';
import { readFile, writeFile } from 'node:fs/promises';
import { stringify } from 'yaml';
import { Logger, logger } from './logger';

/**
 * Helper class to manage secrets in Home Assistant.
 */
export class SecretHelper {
  protected secretFile: string;

  constructor(
    protected secretFolder: string,
    protected logger: Logger
  ) {
    this.secretFile = `${secretFolder}/secrets.yaml`;
  }

  /**
   * Scan for secrets in the Home Assistant configuration folder.
   */
  async scanForSecrets() {
    const files = await glob(`${this.secretFolder}/**/*.yaml`);
    const secrets = (
      await Promise.all(files.map((file) => this.searchForSecrets(file)))
    ).filter((s) => s);

    return (
      secrets
        // Flat the array of secrets per file into a single array
        .flat()
        // Remove duplicates (if any)
        .filter((value, index, array) => array.indexOf(value) === index)
    );
  }

  /**
   * Save secrets to the secrets file.
   */
  async save(secrets: Record<string, string>) {
    if (Object.keys(secrets).length === 0) {
      this.logger.debug('No secrets to save');
      return;
    }

    let secretFileContent = await this.readSecretsFromFile();
    const keys = Object.keys(secrets);

    keys.forEach((key) => {
      const secretLine = stringify({ [key]: secrets[key] }).trim();
      const regexp = new RegExp(`^${key}: (.*)$`, 'gm');
      const match = regexp.exec(secretFileContent);

      if (match) {
        this.logger.info('Updating existing secret: %s', key);
        secretFileContent = secretFileContent.replace(match[0], secretLine);
      } else {
        this.logger.info('Adding new secret: %s', key);
        secretFileContent += `\n${secretLine}`;
      }
    });

    this.logger.info('Saving updated secrets: %s', keys);

    return this.writeSecretsToFile(secretFileContent);
  }

  protected async readSecretsFromFile() {
    return (await readFile(this.secretFile, 'utf-8')).trim();
  }

  protected async writeSecretsToFile(content: string) {
    return writeFile(this.secretFile, content.trim());
  }

  /**
   * Find all secrets in a file.
   */
  protected async searchForSecrets(file: string) {
    const content = await readFile(file, 'utf-8');
    const secrets = [...content.matchAll(/!secret\s+(\w+)/g)];

    return secrets.map((s) => s[1]);
  }
}

export const secretHelper = new SecretHelper(
  process.env.HA_CONFIG_FOLDER as string,
  logger
);
