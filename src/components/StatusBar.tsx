import { useEffect, useState } from 'react';

/** 教师端 UI：与稿一致，左时间、右 Wi‑Fi + 电量（装饰性，非系统 API） */
function WifiIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 text-gray-1">
      <path
        d="M8 11.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z"
        fill="currentColor"
      />
      <path
        d="M4.75 8.35a4.25 4.25 0 0 1 6.5 0"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M2.25 5.85a7.75 7.75 0 0 1 11.5 0"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 text-gray-1">
      <rect x="1.5" y="4" width="10.5" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M13 6.25v3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="3.2" y="5.5" width="6" height="5" rx="0.35" fill="currentColor" />
    </svg>
  );
}

export function StatusBar() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const timeLabel = now.toLocaleTimeString('zh-CN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <header
      className="flex shrink-0 items-center justify-between bg-transparent px-4 py-2"
      aria-label="状态栏"
    >
      <time dateTime={now.toISOString()} className="text-[14px] font-medium leading-none text-gray-1 tabular-nums">
        {timeLabel}
      </time>
      <div className="flex items-center gap-5">
        <WifiIcon />
        <div className="flex items-center gap-1">
          <BatteryIcon />
          <span className="text-[14px] font-medium leading-none text-gray-1 tabular-nums">80%</span>
        </div>
      </div>
    </header>
  );
}
