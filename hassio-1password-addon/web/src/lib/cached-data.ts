/**
 * Cached Data Layer - Service-level caching with Cache Components
 *
 * This module provides cached wrapper functions for data fetching operations.
 * Using 'use cache' at the service level allows:
 * - Reusable caching across different pages/components
 * - Granular cache control with cacheTag and cacheLife
 * - Efficient invalidation with updateTag
 *
 * Note: All data is serialized via JSON to ensure compatibility with Client Components
 */

'use cache';

import { onePasswordService } from '@/service/1password.service';
import { groupService } from '@/service/group.service';
import { rateLimitService } from '@/service/ratelimit.service';
import { haSecretService } from '@/service/secret.service';
import { cacheLife, cacheTag } from 'next/cache';

/**
 * Serialize data to plain objects, removing symbol properties.
 * Handles undefined/null safely to prevent JSON.parse errors.
 */
const serialize = <T>(data: T): T => {
  if (data === undefined || data === null) return data as T;
  return JSON.parse(JSON.stringify(data));
};

/**
 * Get all groups with caching
 * Tags: 'groups'
 * Lifetime: ~60 seconds (minutes profile)
 */
export async function getCachedGroups() {
  cacheTag('groups');
  cacheLife('minutes');

  const groups = await groupService.getGroups();
  return serialize(groups);
}

/**
 * Get a specific group by ID with caching
 * Tags: 'groups', 'group-{id}'
 * Lifetime: ~60 seconds (minutes profile)
 */
export async function getCachedGroup(id: string) {
  cacheTag('groups', `group-${id}`);
  cacheLife('minutes');

  const group = await groupService.getGroup(id);
  return serialize(group);
}

/**
 * Get all Home Assistant secrets with caching
 * Tags: 'secrets'
 * Lifetime: ~60 seconds (minutes profile)
 */
export async function getCachedSecrets() {
  cacheTag('secrets');
  cacheLife('minutes');

  const secrets = await haSecretService.getSecrets();
  return serialize(secrets);
}

/**
 * Get a specific secret by ID with caching
 * Tags: 'secrets', 'secret-{id}'
 * Lifetime: ~60 seconds (minutes profile)
 */
export async function getCachedSecret(id: string) {
  cacheTag('secrets', `secret-${id}`);
  cacheLife('minutes');

  const secret = await haSecretService.getSecret(id);
  return serialize(secret);
}

/**
 * Get 1Password items with pagination and caching
 * Tags: 'op-items'
 * Lifetime: ~1 hour (hours profile) - 1Password items change less frequently
 *
 * Note: Pagination params automatically become part of cache key
 */
export async function getCachedOpItems(params: {
  pagination: { page: number; limit: number };
}) {
  cacheTag('op-items');
  cacheLife('hours');

  const result = await onePasswordService.getItems(params);
  return serialize(result);
}

/**
 * Get next scheduled update time with caching
 * Tags: 'op-metadata'
 * Lifetime: ~60 seconds (minutes profile)
 */
export async function getCachedNextUpdate() {
  cacheTag('op-metadata');
  cacheLife('minutes');

  const nextUpdate = await onePasswordService.getNextUpdate();
  return serialize(nextUpdate);
}

/**
 * Get rate limit data with caching
 * Tags: 'rate-limits'
 * Lifetime: ~60 seconds (minutes profile)
 */
export async function getCachedRateLimits() {
  cacheTag('rate-limits');
  cacheLife('minutes');

  const rateLimits = await rateLimitService.getRateLimits();
  return serialize(rateLimits);
}

/**
 * Check if rate limit warning should be shown with caching
 * Tags: 'rate-limits'
 * Lifetime: ~60 seconds (minutes profile)
 */
export async function getCachedRateLimitWarning() {
  cacheTag('rate-limits');
  cacheLife('minutes');

  const shouldShow = await rateLimitService.shouldShowWarning();
  const warnings = shouldShow ? await rateLimitService.getWarningLimits() : [];

  return serialize({ shouldShow, warnings });
}
