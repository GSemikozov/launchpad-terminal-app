import { format, formatDistance, formatDistanceToNow } from 'date-fns';

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string | number, formatStr = 'PP'): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format time ago (e.g., "2 hours ago")
 */
export function formatTimeAgo(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Format distance between two dates
 */
export function formatDateDistance(
  dateLeft: Date | string | number,
  dateRight: Date | string | number
): string {
  const left =
    typeof dateLeft === 'string' || typeof dateLeft === 'number' ? new Date(dateLeft) : dateLeft;
  const right =
    typeof dateRight === 'string' || typeof dateRight === 'number'
      ? new Date(dateRight)
      : dateRight;
  return formatDistance(left, right);
}
