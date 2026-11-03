import { JsonCode, YamlCode } from '@/components/ui/code';
import { CopyButton } from '@/components/ui/copy-button';
import { EventName } from '@/components/ui/event-name';
import { PageContainer, PageHeader } from '@/components/ui/page';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';

const EXAMPLE_TIMESTAMP = '2026-11-03T12:21:04.512Z';

const RESTART_ADDON_YAML = `alias: "Update PS5 Token and Restart App"
description: "Restarts the PS5 MQTT add-on when its secret is updated"
mode: single

trigger:
  - platform: event
    event_type: "onepassword_secret_written"

condition:
  - condition: template
    value_template: "{{ trigger.event.data.secretName == 'ps5_token' }}"

action:
  - service: hassio.addon_restart
    data:
      addon: "df2164f9_ps5_mqtt"`;

const NOTIFY_GROUP_YAML = `alias: "Notify for Xiaomi Secret Update"
description: "Prompts a manual restart when Xiaomi secrets are updated"
mode: single

trigger:
  - platform: event
    event_type: "onepassword_group_xiaomi_updated"

action:
  - service: notify.persistent_notification
    data:
      title: "Xiaomi secrets updated"
      message: "Restart Home Assistant to apply the new Xiaomi credentials."
      notification_id: "xiaomi_restart_needed"`;

const SECTIONS = ['sync', 'groups', 'ui', 'errors'] as const;

const EVENTS = [
  {
    name: 'onepassword_secrets_synced',
    section: 'sync',
    triggerKey: 'secretsSynced',
    payload: {
      changedCount: 2,
      changedSecrets: ['db_password', 'api_key'],
      changedGroups: ['production']
    }
  },
  {
    name: 'onepassword_secret_written',
    section: 'sync',
    triggerKey: 'secretWritten',
    payload: { secretName: 'db_password' }
  },
  {
    name: 'onepassword_group_{name}_updated',
    section: 'groups',
    triggerKey: 'groupUpdated',
    payload: {
      groupName: 'production',
      updatedSecrets: ['db_password', 'redis_url']
    }
  },
  {
    name: 'onepassword_secret_assigned',
    section: 'ui',
    triggerKey: 'secretAssigned',
    payload: { secretName: 'db_password' }
  },
  {
    name: 'onepassword_secret_unassigned',
    section: 'ui',
    triggerKey: 'secretUnassigned',
    payload: { secretName: 'old_api_key' }
  },
  {
    name: 'onepassword_item_refreshed',
    section: 'ui',
    triggerKey: 'itemRefreshed',
    payload: {
      itemId: 'xyz789',
      vaultId: 'vault123',
      affectedSecrets: ['db_password', 'db_username']
    }
  },
  {
    name: 'onepassword_error',
    section: 'errors',
    triggerKey: 'error',
    payload: { errorType: 'sync_failed', error: 'Network connection timeout' }
  }
] as const;

const code = (chunks: ReactNode) => (
  <code className="font-mono text-[12.5px]">{chunks}</code>
);

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="text-muted mb-2.5 text-[12px] font-medium tracking-[.1em] uppercase">
    {children}
  </h2>
);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('menu');
  return { title: t('help') };
}

export default async function Help() {
  const t = await getTranslations('events');

  const examples = [
    { name: t('info.examples.restartAddon'), yaml: RESTART_ADDON_YAML },
    { name: t('info.examples.notifyGroup'), yaml: NOTIFY_GROUP_YAML }
  ];

  return (
    <PageContainer>
      <PageHeader
        title={t('info.title')}
        description={t.rich('info.description', { code })}
      />

      <div className="space-y-7">
        {SECTIONS.map((section) => (
          <section key={section}>
            <SectionTitle>{t(`sections.${section}`)}</SectionTitle>
            <div className="space-y-2">
              {EVENTS.filter((event) => event.section === section).map(
                (event) => (
                  <details
                    key={event.name}
                    name="events"
                    open={event.name === 'onepassword_secrets_synced'}
                    className="collapse-arrow rounded-box hairline surface collapse border"
                  >
                    <summary className="collapse-title flex min-h-0 flex-col gap-1.5 !py-3 !pr-10 !pl-4 sm:flex-row sm:items-center sm:gap-3 sm:!pl-5">
                      <span className="inline-flex shrink-0 items-center gap-2 self-start sm:self-center">
                        {event.section === 'errors' && (
                          <span className="dot bg-error" aria-hidden="true" />
                        )}
                        <EventName name={event.name} className="!text-[13px]" />
                      </span>
                      <span className="text-base-content/75 min-w-0 text-[13px]">
                        {t(`info.events.${event.triggerKey}.trigger`, {
                          name: '{name}'
                        })}
                      </span>
                    </summary>
                    <div className="collapse-content !px-4 sm:!px-5">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-muted text-[11.5px] tracking-wider uppercase">
                          {t('info.examplePayload')}
                        </span>
                        <CopyButton
                          text={event.name}
                          label={t('info.copyEvent')}
                        />
                      </div>
                      <pre className="code-block">
                        <JsonCode
                          data={{
                            ...event.payload,
                            timestamp: EXAMPLE_TIMESTAMP
                          }}
                        />
                      </pre>
                    </div>
                  </details>
                )
              )}
            </div>
          </section>
        ))}

        <section>
          <SectionTitle>{t('info.examples.title')}</SectionTitle>
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {examples.map((example) => (
              <div
                key={example.name}
                className="rounded-box hairline surface overflow-hidden border"
              >
                <div className="hairline flex items-center justify-between gap-3 border-b px-4 py-2.5">
                  <span className="text-[13px] font-medium">
                    {example.name}
                  </span>
                  <CopyButton text={example.yaml} label={t('info.copyYaml')} />
                </div>
                <pre className="code-block !rounded-none !border-0 !bg-transparent">
                  <YamlCode text={example.yaml} />
                </pre>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
