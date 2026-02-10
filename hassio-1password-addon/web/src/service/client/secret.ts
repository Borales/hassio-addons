import { glob } from 'glob';
import { readFile, writeFile } from 'node:fs/promises';
import { parse, stringify } from 'yaml';
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
   * This includes both:
   * 1. Secrets referenced via !secret in YAML files
   * 2. Secrets already defined in secrets.yaml (used by add-ons)
   */
  async scanForSecrets() {
    const files = await glob(`${this.secretFolder}/**/*.yaml`);
    const referencedSecrets = (
      await Promise.all(files.map((file) => this.searchForSecrets(file)))
    ).filter((s) => s);

    const uniqueReferencedSecrets = referencedSecrets
      // Flat the array of secrets per file into a single array
      .flat()
      // Remove duplicates (if any)
      .filter((value, index, array) => array.indexOf(value) === index);

    // Also include secrets that exist in secrets.yaml
    const existingSecretKeys = await this.getExistingSecretKeys();

    // Merge both lists and remove duplicates
    const allSecrets = [
      ...uniqueReferencedSecrets,
      ...existingSecretKeys
    ].filter((value, index, array) => array.indexOf(value) === index);

    this.logger.debug(
      'Found %d referenced secrets and %d existing secrets in secrets.yaml (total: %d unique)',
      uniqueReferencedSecrets.length,
      existingSecretKeys.length,
      allSecrets.length
    );

    return allSecrets;
  }

  /**
   * Get all secret keys currently defined in secrets.yaml.
   * These may be used by add-ons even if not referenced in other YAML files.
   */
  async getExistingSecretKeys(): Promise<string[]> {
    try {
      const content = await this.readSecretsFromFile();
      if (!content) {
        return [];
      }

      const parsed = parse(content);
      if (!parsed || typeof parsed !== 'object') {
        return [];
      }

      return Object.keys(parsed);
    } catch (error) {
      this.logger.debug('Failed to parse secrets.yaml: %s', error);
      return [];
    }
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

  /**
   * Read the raw content of the secrets file.
   */
  async readSecretsFromFile() {
    try {
      return (await readFile(this.secretFile, 'utf-8')).trim();
    } catch {
      return '';
    }
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
