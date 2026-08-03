import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { formatThaiDate } from '../lib/dateUtils';

interface Props {
  className?: string;
}

export function CurrentTimeDisplay({ className }: Props) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={className || "hidden lg:flex items-center gap-2 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200"}>
      <Clock className="h-3.5 w-3.5 opacity-70" />
      <span>{formatThaiDate(time.toISOString())}</span>
      <span className="font-mono bg-white/80 px-1.5 py-0.5 rounded shadow-sm text-slate-700">
        {time.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
    </div>
  );
}
