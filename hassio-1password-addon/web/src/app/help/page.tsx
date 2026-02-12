'use client';

import { Card, CardBody, Chip, Code } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { memo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default async function Help() {
  const t = useTranslations('events.info');

  const examples = [
    {
      name: 'Restarting an Add-on via Secret Event',
      content: `alias: "Update PS5 Token and Restart App"
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
      addon: "df2164f9_ps5_mqtt"`
    },
    {
      name: 'Notification for Xiaomi Integration Update',
      content: `alias: "Notify for Xiaomi Secret Update"
description: "Prompts a manual restart when Xiaomi Cloud Map Extractor secrets are updated"
mode: single

trigger:
  - platform: event
    event_type: "onepassword_group_xiaomi_updated"

action:
  - service: notify.persistent_notification
    data:
      title: "Xiaomi Cloud Map Extractor Secrets Updated"
      message: "New Xiaomi Cloud Map Extractor secrets have been detected. Please restart Home Assistant to apply these changes to the integration."
      notification_id: "xiaomi_restart_needed"`
    }
  ];

  const events = [
    {
      name: 'onepassword_secrets_synced',
      trigger: t('events.secretsSynced.trigger'),
      example: {
        changedCount: 2,
        changedSecrets: ['db_password', 'api_key'],
        changedGroups: ['production']
      }
    },
    {
      name: 'onepassword_secret_written',
      trigger: t('events.secretWritten.trigger'),
      example: {
        secretName: 'db_password'
      }
    },
    {
      name: 'onepassword_secret_assigned',
      trigger: t('events.secretAssigned.trigger'),
      example: {
        secretName: 'db_password'
      }
    },
    {
      name: 'onepassword_secret_unassigned',
      trigger: t('events.secretUnassigned.trigger'),
      example: {
        secretName: 'old_api_key'
      }
    },
    {
      name: 'onepassword_item_refreshed',
      trigger: t('events.itemRefreshed.trigger'),
      example: {
        itemId: 'xyz789',
        vaultId: 'vault123',
        affectedSecrets: ['db_password', 'db_username']
      }
    },
    {
      name: 'onepassword_group_{name}_updated',
      trigger: t('events.groupUpdated.trigger', { name: 'production' }),
      example: {
        groupName: 'production',
        updatedSecrets: ['db_password', 'redis_url']
      }
    },
    {
      name: 'onepassword_error',
      trigger: t('events.error.trigger'),
      example: {
        errorType: 'sync_failed',
        error: 'Network connection timeout'
      }
    }
  ];

  return (
    <>
      <div className="mb-4">
        <h3 className="text-foreground mb-2 text-xl font-semibold">
          {t('title')}
        </h3>
        <p className="text-default-500 text-sm">{t('description')}</p>
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-col gap-3">
            {events.map((event) => (
              <EventItem
                key={event.name}
                name={event.name}
                trigger={event.trigger}
                example={event.example}
              />
            ))}
          </div>

          <div className="bg-default-100 dark:bg-default-50 rounded-lg p-3">
            <p className="text-default-600 text-xs">
              <span className="font-semibold">{t('note.title')}</span>{' '}
              {t('note.description')}
            </p>
          </div>
        </CardBody>
      </Card>

      <div className="mt-6">
        <h3 className="text-foreground mb-2 text-xl font-semibold">
          {t('examples.title')}
        </h3>
        <p className="text-default-500 mb-4 text-sm">
          {t('examples.description')}
        </p>

        <div className="flex flex-col gap-4">
          {examples.map((example, index) => (
            <Card key={index}>
              <CardBody>
                <h4 className="text-foreground mb-3 text-lg font-semibold">
                  {example.name}
                </h4>
                <div className="overflow-x-auto rounded-lg">
                  <SyntaxHighlighter
                    language="yaml"
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem'
                    }}
                    showLineNumbers
                  >
                    {example.content}
                  </SyntaxHighlighter>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

const EventItem = memo(
  ({
    name,
    trigger,
    example
  }: {
    name: string;
    trigger: string;
    example: Record<string, unknown>;
  }) => {
    return (
      <div className="border-divider flex flex-col gap-2 border-b pb-3 last:border-0 last:pb-0">
        <div className="flex items-center gap-2">
          <Chip size="md" variant="flat" color="primary" className="font-mono">
            {name}
          </Chip>
        </div>
        <p className="text-default-600 text-sm">{trigger}</p>
        <Code size="sm" className="text-xs leading-relaxed">
          <pre>{JSON.stringify(example, null, 2)}</pre>
        </Code>
      </div>
    );
  }
);
