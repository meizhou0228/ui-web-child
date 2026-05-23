import { useEffect, useState } from 'react';
import { todayKey } from '@/utils/date';

export function useDayChange(): string {
  const [day, setDay] = useState(todayKey());
  useEffect(() => {
    const id = setInterval(() => {
      const t = todayKey();
      setDay((cur) => (cur === t ? cur : t));
    }, 60_000);
    return () => clearInterval(id);
  }, []);
  return day;
}
