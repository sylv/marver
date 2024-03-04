import { formatDate } from '../../../../helpers/formatDate';

export const formatExifValue = (value: string | number | Date | null | undefined) => {
  if (value == null) return '—';
  if (typeof value === 'number') return value.toFixed(2);
  if (typeof value === 'string' && value.includes('-')) {
    // todo: i think graphql should do this for us, but idk, im lazy.
    const date = new Date(value);
    const isValid = !Number.isNaN(date.getTime());
    if (isValid) {
      value = date;
    }
  }

  if (value instanceof Date) {
    return (
      <span suppressHydrationWarning title={value.toLocaleString()}>
        {formatDate(value)}
      </span>
    );
  }

  return value;
};
