// Type-only exports for client components
// These types are used by both server and client components

export type GroupWithSecrets = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  secrets: Array<{
    secretId: string;
    addedAt: Date;
  }>;
};

export type HaSecretItem = {
  id: string;
  reference: string | null;
  itemId: string | null;
  updatedAt: Date | null;
  isSkipped: boolean | null;
  groups?: Array<{ id: string; name: string }>;
};
