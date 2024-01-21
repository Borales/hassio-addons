import { item, read } from "@1password/op-js";

export class OnePasswordClient {
  constructor() {}

  /**
   * Get an item by its ID.
   */
  async getItem(id: string, vault: string) {
    return item.get(id, { vault });
  }

  /**
   * Get all items.
   */
  async getItems() {
    return item.list();
  }

  /**
   * Read an item by its reference ID.
   */
  async readItemByReference(referenceId: string) {
    return read.parse(referenceId);
  }
}

export const onePasswordClient = new OnePasswordClient();
