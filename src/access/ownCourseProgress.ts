import type { Access } from 'payload'

/**
 * Restricts access to course progress documents so users can only
 * read/update their own (user field equals current user). Admins can do anything.
 */
export const ownCourseProgress: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.roles?.includes('admin')) return true
  return {
    user: { equals: user.id },
  }
}
