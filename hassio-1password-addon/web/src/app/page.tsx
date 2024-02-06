import { HASecretList } from '@/components/ha-secret/secret-list';
import { HASecretModal } from '@/components/ha-secret/secret-modal';
import { onePasswordService } from '@/service/1password.service';
import { haSecretService } from '@/service/secret.service';

const jsonJiggle = (obj: any) => JSON.parse(JSON.stringify(obj));

export default async function Home({ searchParams }: { searchParams: any }) {
  const page: number = Number(searchParams.page || 1);
  const activeSecretId = searchParams.secretId || '';
  const nextUpdate = await onePasswordService.getNextUpdate();
  const [items] = await onePasswordService.getItems({
    pagination: { page, limit: 1000 }
  });
  let activeSecret;

  const secrets = await haSecretService.getSecrets();

  if (activeSecretId) {
    activeSecret = await haSecretService.getSecret(activeSecretId);
  }

  return (
    <>
      {activeSecret && (
        <HASecretModal
          activeSecret={jsonJiggle(activeSecret)}
          opItems={jsonJiggle(items)}
        />
      )}

      <HASecretList items={secrets} />

      <p className="text-center font-mono text-xs text-default-400">
        {nextUpdate && (
          <>Next update: {new Date(nextUpdate).toLocaleString()}</>
        )}
        {!nextUpdate && <>Not synced yet</>}
      </p>
    </>
  );
}
