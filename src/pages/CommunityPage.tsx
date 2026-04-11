import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';
import { CommunityCard } from '../components/CommunityCard';
import { useCommunityFeed } from '../context/CommunityFeedContext';

/**
 * 瀑布流列数：默认 2 列（Pad 竖屏 / 窄屏）；≥900px 3 列（Pad 横屏）；≥1280px 4 列（PC）
 * 对应设计稿 1000×600 主内容区约 831px → 3 列
 */
function MasonryGrid({ children }: { children: ReactNode }) {
  return (
    <div className="columns-2 gap-6 min-[900px]:columns-3 xl:columns-4">{children}</div>
  );
}

const STUDENT_COMMUNITY_SWITCH_ICON_SRC = `/${encodeURIComponent('ic_转换_20.svg')}`;

type CommunityPageProps = {
  /** 列表与投稿、详情链接前缀：`/community`（弹窗详情）或 `/community-pad`（全屏详情） */
  routePrefix?: string;
};

export function CommunityPage({ routePrefix = '/community' }: CommunityPageProps) {
  const navigate = useNavigate();
  const submitPath = `${routePrefix}/submit`;
  const submitOpen = Boolean(useMatch({ path: submitPath, end: true }));
  const pageTitle = routePrefix === '/community-pad' ? '社区pad' : '社区';
  const { posts, loading, refreshing, error, hasMore, refreshFeed, loadMore } = useCommunityFeed();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const [ptrState, setPtrState] = useState<'idle' | 'pulling'>('idle');
  const pullStartY = useRef(0);
  const pullDelta = useRef(0);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !scrollRoot) return;
    const ob = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading && !refreshing) loadMore();
      },
      { root: scrollRoot, rootMargin: '240px' },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [hasMore, loading, loadMore, posts.length, refreshing, scrollRoot]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (!scrollRoot || scrollRoot.scrollTop > 0) return;
    pullStartY.current = e.touches[0].clientY;
    pullDelta.current = 0;
  }, [scrollRoot]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!scrollRoot || scrollRoot.scrollTop > 0) return;
    const y = e.touches[0].clientY;
    const d = y - pullStartY.current;
    if (d > 8) {
      pullDelta.current = d;
      setPtrState('pulling');
    }
  }, [scrollRoot]);

  const runPtrRefresh = useCallback(async () => {
    await refreshFeed();
  }, [refreshFeed]);

  const onTouchEnd = useCallback(() => {
    if (ptrState === 'pulling' && pullDelta.current > 56) {
      void runPtrRefresh();
    }
    setPtrState('idle');
    pullDelta.current = 0;
  }, [ptrState, runPtrRefresh]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-gradient-to-b from-[#f5faff] from-[53%] to-white">
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="shrink-0 text-[20px] font-semibold leading-tight text-gray-1">{pageTitle}</h1>
          <span className="min-w-0 text-[13px] font-normal leading-[1.5] text-gray-3">
            让每一个好用的功能，在真实的课堂里闪光
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/student-community')}
            className="box-border inline-flex h-8 min-w-[76px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-[18px] border border-[#9CB1FC] bg-white px-4 text-[14px] font-medium leading-[1.5] text-primary-2 transition-colors hover:bg-fill-gray-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-2/35"
          >
            <img
              src={STUDENT_COMMUNITY_SWITCH_ICON_SRC}
              alt=""
              width={14}
              height={14}
              className="pointer-events-none h-[14px] w-[14px] shrink-0 object-contain"
              draggable={false}
              aria-hidden
            />
            学生社区
          </button>
          <button
            type="button"
            onClick={() => navigate(submitPath)}
            className="box-border inline-flex h-8 w-[100px] shrink-0 items-center justify-center rounded-[18px] bg-primary-2 px-4 text-[14px] font-medium leading-[1.5] text-white transition-[filter] hover:brightness-[0.96] active:brightness-[0.9] focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-2/35"
            aria-haspopup="dialog"
            aria-expanded={submitOpen}
          >
            我要投稿
          </button>
        </div>
      </header>

      <div
        ref={setScrollRoot}
        className="relative min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 pb-6 pt-0"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {refreshing && posts.length > 0 ? (
          <div className="pointer-events-none absolute left-0 right-0 top-2 z-10 text-center text-[12px] font-medium text-primary-1">
            刷新中…
          </div>
        ) : ptrState === 'pulling' ? (
          <div className="pointer-events-none absolute left-0 right-0 top-2 z-10 text-center text-[12px] text-gray-3">
            松开即可刷新
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-[12px] border border-line-1 bg-white p-4 text-[14px] text-gray-2">
            {error}
          </div>
        ) : null}

        {loading && posts.length === 0 ? (
          <div className="py-20 text-center text-[14px] text-gray-3">正在生成你的内容排序…</div>
        ) : (
          <MasonryGrid>
            {posts.map((p) => (
              <div key={p.id} className="mb-6">
                <CommunityCard post={p} detailBase={routePrefix} />
              </div>
            ))}
          </MasonryGrid>
        )}

        <div ref={sentinelRef} className="h-4 w-full shrink-0" aria-hidden />

        {!hasMore && posts.length > 0 ? (
          <div
            role="status"
            className="mx-auto flex min-h-[61px] w-full max-w-2xl items-center gap-3 px-2 pb-8 pt-2"
          >
            <div className="h-px min-w-6 flex-1 bg-line-2" aria-hidden />
            <p className="m-0 max-w-[min(100%,20rem)] align-middle text-center text-[13px] leading-[1.6] text-gray-3">
              到底啦！社区内容持续上新中，期待你的分享
            </p>
            <div className="h-px min-w-6 flex-1 bg-line-2" aria-hidden />
          </div>
        ) : null}
      </div>
    </div>
  );
}
