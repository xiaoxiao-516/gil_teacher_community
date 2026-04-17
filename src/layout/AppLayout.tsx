import { useState, type ComponentType } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  IconSidebarCalendarDot,
  IconSidebarCommunity,
  IconSidebarData,
  IconSidebarPublish,
  IconSidebarReport,
  IconSidebarResource,
} from '../components/SidebarNavIcons';
import { StatusBar } from '../components/StatusBar';
import { publicAssetUrl } from '../lib/publicAssetUrl';

const navRowPrimary =
  'flex h-12 w-full shrink-0 items-center gap-2 rounded-xl py-1.5 pl-4 pr-4 text-[16px] font-medium leading-[1.5] no-underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-2';

type PrimaryItem = { to: string; label: string; Icon: ComponentType<{ className?: string }> };

const PRIMARY_NAV: PrimaryItem[] = [
  { to: '/assign', label: '布置', Icon: IconSidebarPublish },
  { to: '/class', label: '上课', Icon: IconSidebarCalendarDot },
  { to: '/report', label: '报告', Icon: IconSidebarReport },
  { to: '/resources', label: '资源', Icon: IconSidebarResource },
  { to: '/situation', label: '学情', Icon: IconSidebarData },
];

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  const communityActive =
    pathname === '/community' ||
    (pathname.startsWith('/community/') && !pathname.startsWith('/community-pad'));
  const communityPadActive =
    pathname === '/community-pad' || pathname.startsWith('/community-pad/');

  return (
    <div className="app-scale flex h-full min-h-0 w-full flex-col overflow-hidden bg-fill-light">
      <StatusBar />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside
          className={`relative flex h-full shrink-0 flex-col bg-primary-6 transition-all duration-300 ${
            collapsed ? 'w-0 overflow-hidden' : 'w-[169px]'
          }`}
        >
          <div className="flex h-full min-h-0 flex-col justify-between px-5 pb-4 pt-4">
            <div className="flex shrink-0 flex-col gap-4">
              <div
                className="flex h-12 w-full max-w-[129px] shrink-0 items-center gap-2 overflow-hidden pl-4"
                aria-label="小鹿爱学"
              >
                <div className="relative h-6 w-6 shrink-0">
                  <div
                    className="absolute inset-0 rounded-full bg-[rgba(35,37,66,0.12)]"
                    aria-hidden
                  />
                  <img
                    src={publicAssetUrl('logo-sidebar-mark.png')}
                    alt=""
                    width={24}
                    height={24}
                    className="relative z-[1] h-6 w-6 rounded-full object-cover"
                  />
                </div>
                <span className="min-w-0 truncate text-[18px] font-medium leading-[1.5] tracking-[1.08px] text-gray-1">
                  小鹿爱学
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                  {PRIMARY_NAV.map(({ to, label, Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        `${navRowPrimary} ${isActive ? 'text-primary-1' : 'text-gray-3'}`
                      }
                    >
                      <Icon className="shrink-0" />
                      {label}
                    </NavLink>
                  ))}
                </div>

                <div className="h-px w-full shrink-0 bg-line-2" aria-hidden />

                <NavLink
                  to="/community"
                  aria-current={communityActive ? 'page' : undefined}
                  className={() =>
                    `${navRowPrimary} border-[0.5px] border-solid ${communityActive ? 'border-line-2 bg-white text-primary-1' : 'border-transparent text-gray-3'}`
                  }
                >
                  <IconSidebarCommunity className="shrink-0" />
                  <span className="flex min-w-0 flex-1 items-center gap-1">
                    <span className="shrink-0 whitespace-nowrap">社区</span>
                    <span
                      lang="en"
                      className="sidebar-nav-new-badge--breath inline-flex h-[12px] shrink-0 origin-left items-center justify-center rounded-tl-[7px] rounded-tr-[7px] rounded-br-[7px] rounded-bl-[2px] px-[3px] text-[9px] font-semibold uppercase leading-none tracking-wide text-white bg-[#FA5A57]"
                      aria-hidden
                    >
                      New
                    </span>
                  </span>
                </NavLink>
                <NavLink
                  to="/community-pad"
                  aria-current={communityPadActive ? 'page' : undefined}
                  className={() =>
                    `${navRowPrimary} border-[0.5px] border-solid ${communityPadActive ? 'border-line-2 bg-white text-primary-1' : 'border-transparent text-gray-3'}`
                  }
                >
                  <IconSidebarCommunity className="shrink-0" />
                  社区pad
                </NavLink>
              </div>
            </div>

            <div className="flex h-12 w-full shrink-0 items-center gap-2 rounded-xl py-1.5">
              <img
                src={publicAssetUrl('sidebar-user-avatar.png')}
                alt="宋萍"
                width={196}
                height={196}
                className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-line-2"
                draggable={false}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium leading-[1.5] text-gray-2">宋萍</p>
                <p className="truncate text-[10px] leading-[1.5] text-gray-4">教师 ID: 135121</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-label={collapsed ? '展开侧栏' : '收起侧栏'}
            onClick={() => setCollapsed((c) => !c)}
            className={`absolute top-1/2 z-20 flex h-[58px] w-[11px] -translate-y-1/2 items-center shadow-[2px_0_8px_rgba(0,0,0,0.02)] transition-all duration-300 ${
              collapsed ? 'left-0' : 'right-0'
            }`}
          >
            <img
              src={publicAssetUrl('collapse-arrow.svg')}
              alt=""
              className={`h-full w-full ${collapsed ? 'scale-x-[-1]' : ''}`}
            />
          </button>
        </aside>

        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
