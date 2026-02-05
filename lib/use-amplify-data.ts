'use client'

import { generateClient } from 'aws-amplify/data'
import type { Schema } from '@/amplify/data/resource'

/**
 * Get a typed Amplify Data client for CRUD operations
 *
 * @example
 * const client = useAmplifyData()
 *
 * // Create a category
 * await client.models.Category.create({
 *   categoryId: 'mercado',
 *   label: 'Mercado',
 *   color: '#10b981',
 *   isSystem: false,
 *   order: 0
 * })
 *
 * // List all categories
 * const { data: categories } = await client.models.Category.list()
 *
 * // Update a category
 * await client.models.Category.update({
 *   id: 'category-id',
 *   label: 'Supermercado'
 * })
 *
 * // Delete a category
 * await client.models.Category.delete({ id: 'category-id' })
 */
export function useAmplifyData() {
  return generateClient<Schema>()
}
