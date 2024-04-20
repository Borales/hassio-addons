'use client';

import { HASecretItem, Item } from './secret-item';

type HASecretListProps = {
  items: Item[];
};

export const HASecretList = ({ items }: HASecretListProps) => {
  return (
    <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => (
        <HASecretItem key={index} item={item} />
      ))}
    </section>
  );
};
