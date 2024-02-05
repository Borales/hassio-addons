import { glob } from 'glob';
import { readFile } from 'node:fs/promises';

export class SecretHelper {
  constructor(public secretFolder: string) {}

}

export const secretHelper = new SecretHelper(
  process.env.HA_CONFIG_FOLDER as string
);
