import { OpSecretList } from '@/components/op-secret/secret-list';
import { onePasswordService } from '@/service/1password.service';

const jsonJiggle = (obj: any) => JSON.parse(JSON.stringify(obj));

type OpPageProps = { searchParams: { page?: string } };

export default async function OpPage({ searchParams }: OpPageProps) {
  const page: number = Number(searchParams.page || 1);
  const [items, pagination] = await onePasswordService.getItemsSecurely({
    pagination: { page, limit: 12 }
  });

  return <OpSecretList items={jsonJiggle(items)} pagination={pagination} />;
}
