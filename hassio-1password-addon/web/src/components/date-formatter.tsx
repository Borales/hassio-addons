'use client';

import TimeAgo from 'react-timeago';

type DateFormatterProps = {
  date: Date | string;
  locale?: string;
};

export const CustomTimeAgo = ({ date, locale = 'en' }: DateFormatterProps) => {
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: '2-digit',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });

  return (
    <TimeAgo
      title={new Date(date).toISOString()}
      date={dateFormatter.format(new Date(date))}
    />
  );
};
