import { Item, item, read } from '@1password/op-js';

export type { Item as OpClientItem };

export class OnePasswordClient {
  constructor() {}

  /**
   * Get an item by its ID.
   */
  getItem(id: string, vault: string) {
    return item.get(id, { vault });
  }

  /**
   * Get all items.
   */
  getItems() {
    return item.list();
  }

  /**
   * Read an item by its reference ID.
   */
  readItemByReference(referenceId: string) {
    return read.parse(referenceId);
  }
}

export const onePasswordClient = new OnePasswordClient();
