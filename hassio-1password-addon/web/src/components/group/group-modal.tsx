'use client';

import { createGroup } from '@/actions/group-create';
import { updateGroup } from '@/actions/group-update';
import { groupNameSchema } from '@/lib/group-validation';
import { GroupWithSecrets, HaSecretItem } from '@/types/group';
import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea
} from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useMemo, useState } from 'react';

type GroupModalProps = {
  group: GroupWithSecrets | null;
  secrets: HaSecretItem[];
  isNew: boolean;
};

export const GroupModal = ({ group, secrets, isNew }: GroupModalProps) => {
  const router = useRouter();
  const [name, setName] = useState(group?.name || '');
  const [description, setDescription] = useState(group?.description || '');
  const [selectedSecrets, setSelectedSecrets] = useState<Set<string>>(
    new Set(group?.secrets.map((s) => s.secretId) || [])
  );

  const action = isNew ? createGroup : updateGroup;
  const [state, formAction, isPending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      return action(formData);
    },
    null
  );

  // Validate name (computed synchronously during render)
  const nameError = useMemo(() => {
    if (!name) return null;
    const result = groupNameSchema.safeParse(name);
    return result.success ? null : result.error.issues[0].message;
  }, [name]);

  // Close modal on success
  useEffect(() => {
    if (state?.success) {
      router.push('/groups');
    }
  }, [state, router]);

  const handleClose = () => {
    router.push('/groups');
  };

  return (
    <Modal backdrop="blur" size="xl" isOpen={true} onClose={handleClose}>
      <ModalContent>
        {(onClose) => (
          <form action={formAction}>
            {!isNew && <input type="hidden" name="groupId" value={group?.id} />}
            {!isNew && <input type="hidden" name="name" value={name} />}

            <ModalHeader>
              {isNew ? 'Create New Group' : `Edit Group: ${group?.name}`}
            </ModalHeader>

            <ModalBody>
              {state?.error && (
                <div className="bg-danger-50 text-danger mb-4 rounded-lg p-3 text-sm">
                  {state.error}
                </div>
              )}

              <Input
                name={isNew ? 'name' : undefined}
                label="Group Name"
                placeholder="my_service"
                description="Lowercase letters, numbers, underscores, and hyphens only. This will be used in the event name."
                value={name}
                onValueChange={setName}
                isInvalid={!!nameError}
                errorMessage={nameError}
                isRequired
                isReadOnly={!isNew}
                isDisabled={!isNew}
              />

              <Textarea
                name="description"
                label="Description"
                placeholder="Optional description for this group"
                value={description}
                onValueChange={setDescription}
                className="mt-4"
              />

              <Select
                label="Secrets"
                placeholder="Select secrets to include"
                selectionMode="multiple"
                selectedKeys={selectedSecrets}
                onSelectionChange={(keys) =>
                  setSelectedSecrets(keys as Set<string>)
                }
                className="mt-4"
                description="Select the secrets that should trigger this group's event when updated."
              >
                {secrets
                  .filter((s) => !s.isSkipped && s.itemId)
                  .map((secret) => (
                    <SelectItem key={secret.id}>{secret.id}</SelectItem>
                  ))}
              </Select>

              {/* Hidden inputs for selected secrets */}
              {Array.from(selectedSecrets).map((secretId) => (
                <input
                  key={secretId}
                  type="hidden"
                  name="secretIds"
                  value={secretId}
                />
              ))}

              {selectedSecrets.size > 0 && (
                <div className="mt-4">
                  <p className="text-default-500 mb-2 text-sm">
                    Selected secrets:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(selectedSecrets).map((secretId) => (
                      <Chip
                        key={secretId}
                        size="sm"
                        variant="flat"
                        onClose={() => {
                          const newSet = new Set(selectedSecrets);
                          newSet.delete(secretId);
                          setSelectedSecrets(newSet);
                        }}
                        classNames={{ content: 'font-mono text-xs' }}
                      >
                        {secretId}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {name && !nameError && (
                <div className="bg-default-100 mt-4 rounded-lg p-3">
                  <p className="text-default-600 text-sm">
                    Event name:{' '}
                    <code className="text-primary font-mono">
                      onepassword_group_{name}_updated
                    </code>
                  </p>
                </div>
              )}
            </ModalBody>

            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={isPending}
                isDisabled={!!nameError || !name}
              >
                {isNew ? 'Create Group' : 'Save Changes'}
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
};
