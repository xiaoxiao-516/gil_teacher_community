/** 侧栏导航 20×20 图标，描边随 `currentColor`（对齐 Figma 教师端侧栏） */

export function IconSidebarPublish({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M11.667 3.333H5.833A2.5 2.5 0 0 0 3.333 5.833v8.334a2.5 2.5 0 0 0 2.5 2.5h8.334a2.5 2.5 0 0 0 2.5-2.5V9.167"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.333 3.333h3.334v3.334M12.5 10l4.167-4.167"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSidebarCalendarDot({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect
        x="3.333"
        y="4.167"
        width="13.333"
        height="12.5"
        rx="1.667"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path d="M3.333 7.5h13.333M6.667 2.5v2.5M13.333 2.5v2.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <circle cx="10" cy="11.25" r="1.25" fill="currentColor" />
    </svg>
  );
}

export function IconSidebarReport({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M5.833 3.333h5l2.5 2.5v10.834a.833.833 0 0 1-.833.833H5.833a.833.833 0 0 1-.833-.833V4.167c0-.46.373-.834.833-.834Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d="M10.833 3.333v2.5h2.5M7.5 10h5M7.5 12.5h5M7.5 15h3.333" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function IconSidebarResource({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="3.75" y="3.75" width="5" height="5" rx="0.833" stroke="currentColor" strokeWidth="1.25" />
      <rect x="11.25" y="3.75" width="5" height="5" rx="0.833" stroke="currentColor" strokeWidth="1.25" />
      <rect x="3.75" y="11.25" width="5" height="5" rx="0.833" stroke="currentColor" strokeWidth="1.25" />
      <rect x="11.25" y="11.25" width="5" height="5" rx="0.833" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function IconSidebarData({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M4.167 16.667V10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M10 16.667V5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M15.833 16.667v-5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function IconSidebarCommunity({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="7.083" cy="6.667" r="2.083" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M3.333 15.417v-.417a3.333 3.333 0 0 1 3.334-3.333h.833a3.333 3.333 0 0 1 3.333 3.333v.417"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M13.125 7.292a2.292 2.292 0 1 0 0-4.584 2.292 2.292 0 0 0 0 4.584Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M16.667 15.417v-.625a2.708 2.708 0 0 0-1.875-2.575"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}
