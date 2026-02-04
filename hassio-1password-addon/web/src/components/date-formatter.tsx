'use client';

import { useFormatter } from 'next-intl';

type DateFormatterProps = {
  date: Date | string;
};

export const CustomTimeAgo = ({ date }: DateFormatterProps) => {
  const format = useFormatter();
  const dateObj = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  // Show relative time for recent dates (< 7 days)
  if (diffInSeconds < 604800) {
    return (
      <time
        dateTime={dateObj.toISOString()}
        title={format.dateTime(dateObj, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        })}
      >
        {format.relativeTime(dateObj)}
      </time>
    );
  }

  // Show absolute date for older dates
  return (
    <time dateTime={dateObj.toISOString()}>
      {format.dateTime(dateObj, {
        year: '2-digit',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      })}
    </time>
  );
};
