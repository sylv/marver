/**
 * Vaguely twitter-like date formatting.
 */
export const formatDate = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60 * 1000) return 'now';
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h`;
  if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d`;
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};
