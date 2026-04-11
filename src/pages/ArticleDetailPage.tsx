import { useCallback, useEffect, useId, useRef, useState, type ImgHTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatedLikeButton } from '../components/AnimatedLikeButton';
import { PostTagsAboveTitle } from '../components/PostTagPill';
import { DEFAULT_DETAIL_BODY } from '../constants/articleDetail';
import { useCommunityLikes } from '../context/CommunityLikesContext';
import { isAllowedCoverUrl } from '../lib/coverValidation';
import { publicAssetUrl } from '../lib/publicAssetUrl';
import { getPostById } from '../services/communityFeed';
import type { CommunityPost } from '../types/community';

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CarouselEdgeArrow({ direction }: { direction: 'prev' | 'next' }) {
  const isPrev = direction === 'prev';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-white">
      <path
        d={isPrev ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DetailAvatar({ name, src }: { name: string; src?: string }) {
  const c = name.trim().slice(0, 1) || '?';
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [src]);

  const showPhoto = Boolean(src) && !imgFailed;

  const onImgError: ImgHTMLAttributes<HTMLImageElement>['onError'] = () => {
    setImgFailed(true);
  };

  return (
    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-primary-6">
      {showPhoto ? (
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          onError={onImgError}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[14px] font-medium text-primary-1">
          {c}
        </div>
      )}
    </div>
  );
}

function formatPublishedDate(ymd: string): string {
  const parts = ymd.split('-').map((s) => parseInt(s, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return ymd;
  const [y, m, d] = parts;
  return `${y}年${m}月${d}日`;
}

type ArticleDetailPresentation = 'modal' | 'pad';

type ArticleDetailPanelProps = {
  post: CommunityPost;
  presentation: ArticleDetailPresentation;
  onDismiss: () => void;
  titleId: string;
};

const SWIPE_PAGE_INDICATOR_MS = 2000;

function ArticleDetailPanel({ post, presentation, onDismiss, titleId }: ArticleDetailPanelProps) {
  const { ensureBaseline, toggleLike, getState } = useCommunityLikes();
  const [slide, setSlide] = useState(0);
  const [swipePageIndicatorOn, setSwipePageIndicatorOn] = useState(false);
  const swipePageIndicatorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSwipePageIndicatorBriefly = useCallback(() => {
    setSwipePageIndicatorOn(true);
    if (swipePageIndicatorTimerRef.current) {
      clearTimeout(swipePageIndicatorTimerRef.current);
    }
    swipePageIndicatorTimerRef.current = setTimeout(() => {
      setSwipePageIndicatorOn(false);
      swipePageIndicatorTimerRef.current = null;
    }, SWIPE_PAGE_INDICATOR_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (swipePageIndicatorTimerRef.current) {
        clearTimeout(swipePageIndicatorTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    ensureBaseline(post.id, post.likeCount);
  }, [post.id, post.likeCount, ensureBaseline]);

  useEffect(() => {
    setSlide(0);
    setSwipePageIndicatorOn(false);
    if (swipePageIndicatorTimerRef.current) {
      clearTimeout(swipePageIndicatorTimerRef.current);
      swipePageIndicatorTimerRef.current = null;
    }
  }, [post.id]);

  const bodyText = (post.body ?? DEFAULT_DETAIL_BODY).trim();

  const { liked, count } = getState(post.id);
  const mediaList =
    post.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls : [post.coverUrl];
  const currentUrl = mediaList[slide] ?? post.coverUrl;
  const currentOk = isAllowedCoverUrl(currentUrl);

  const swipeTouchRef = useRef<{ x: number; y: number } | null>(null);

  const onSwipeTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (mediaList.length <= 1) return;
      const t = e.touches[0];
      if (!t) return;
      swipeTouchRef.current = { x: t.clientX, y: t.clientY };
    },
    [mediaList.length],
  );

  const onSwipeTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (mediaList.length <= 1) return;
      const start = swipeTouchRef.current;
      swipeTouchRef.current = null;
      if (!start) return;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      const threshold = 48;
      if (Math.abs(dx) < threshold) return;
      if (Math.abs(dx) < Math.abs(dy) * 0.75) return;
      const len = mediaList.length;
      showSwipePageIndicatorBriefly();
      if (dx > 0) {
        setSlide((s) => (s - 1 + len) % len);
      } else {
        setSlide((s) => (s + 1) % len);
      }
    },
    [mediaList.length, showSwipePageIndicatorBriefly],
  );

  const onSwipeTouchCancel = useCallback(() => {
    swipeTouchRef.current = null;
  }, []);

  /** 仅弹窗详情展示左右箭头；全屏 Pad 依赖滑动与底部圆点切换 */
  const showCarouselEdgeArrows = presentation === 'modal';

  const mediaInner = (
    <>
      <div className="absolute inset-0">
        {currentOk ? (
          post.coverAspect === '4:3' ? (
            <>
              <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                <img
                  src={currentUrl}
                  alt=""
                  className="absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 scale-110 object-cover blur-3xl"
                />
                <div className="absolute inset-0 bg-fill-gray-1/50 backdrop-blur-md" />
              </div>
              <img
                src={currentUrl}
                alt=""
                className="absolute inset-0 z-[1] h-full w-full object-contain"
              />
            </>
          ) : (
            <img src={currentUrl} alt="" className="absolute inset-0 h-full w-full object-contain" />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[14px] text-gray-4">
            图片不可用
          </div>
        )}
      </div>
      {mediaList.length > 1 && showCarouselEdgeArrows ? (
        <>
          <button
            type="button"
            aria-label="上一张"
            className="pointer-events-none absolute left-3 top-1/2 z-[15] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-[rgba(16,16,25,0.38)] text-white opacity-0 shadow-m backdrop-blur-sm transition-opacity duration-200 min-[900px]:flex min-[900px]:group-hover:pointer-events-auto min-[900px]:group-hover:opacity-100 hover:bg-[rgba(16,16,25,0.5)]"
            onClick={(e) => {
              e.stopPropagation();
              setSlide((s) => (s - 1 + mediaList.length) % mediaList.length);
            }}
          >
            <CarouselEdgeArrow direction="prev" />
          </button>
          <button
            type="button"
            aria-label="下一张"
            className="pointer-events-none absolute right-3 top-1/2 z-[15] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-[rgba(16,16,25,0.38)] text-white opacity-0 shadow-m backdrop-blur-sm transition-opacity duration-200 min-[900px]:flex min-[900px]:group-hover:pointer-events-auto min-[900px]:group-hover:opacity-100 hover:bg-[rgba(16,16,25,0.5)]"
            onClick={(e) => {
              e.stopPropagation();
              setSlide((s) => (s + 1) % mediaList.length);
            }}
          >
            <CarouselEdgeArrow direction="next" />
          </button>
        </>
      ) : null}
      {mediaList.length > 1 && swipePageIndicatorOn ? (
        <div
          className="pointer-events-none absolute right-[20px] top-[20px] z-20 flex items-center rounded-[18px] bg-[rgba(51,48,45,0.7)] px-1.5 py-1"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="sr-only">
            第 {slide + 1} 张，共 {mediaList.length} 张
          </span>
          <span className="whitespace-nowrap text-[11px] font-medium leading-[1.25] text-white tabular-nums" aria-hidden>
            {slide + 1}/{mediaList.length}
          </span>
        </div>
      ) : null}
    </>
  );

  const carouselDots =
    mediaList.length > 1 ? (
      <div className="flex justify-center gap-2">
        {mediaList.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`第 ${i + 1} 张`}
            aria-current={i === slide}
            className={`h-1.5 rounded-full transition-all ${
              i === slide ? 'w-5 bg-primary-1' : 'w-1.5 bg-line-3 hover:bg-gray-3'
            }`}
            onClick={() => setSlide(i)}
          />
        ))}
      </div>
    ) : null;

  if (presentation === 'pad') {
    const aspectBox =
      post.coverAspect === '4:3'
        ? 'aspect-[4/3] w-full max-w-[min(720px,72vw)] max-h-[min(84dvh,100%)]'
        : 'aspect-[3/4] w-full max-w-[min(560px,62vw)] max-h-[min(84dvh,100%)]';
    return (
      <div className="flex h-full min-h-0 w-full flex-row">
        <h2 id={titleId} className="sr-only">
          {post.title ?? '帖子详情'}
        </h2>

        <div className="flex min-h-0 min-w-0 flex-[1.08] flex-col items-center justify-center gap-5 bg-fill-gray-1 px-4 py-6 min-[900px]:px-6 min-[900px]:py-8">
          <div
            className={`relative w-full touch-pan-y overflow-hidden rounded-[16px] bg-white shadow-m ${aspectBox}`}
            onTouchStart={onSwipeTouchStart}
            onTouchEnd={onSwipeTouchEnd}
            onTouchCancel={onSwipeTouchCancel}
          >
            {mediaInner}
          </div>
          {carouselDots}
        </div>

        <section className="flex min-h-0 min-w-[min(100%,300px)] flex-1 flex-col overflow-hidden border-l border-line-2 bg-white">
          <div className="flex shrink-0 items-start gap-3 px-6 pb-4 pt-6">
            <DetailAvatar name={post.teacherName} src={post.teacherAvatarUrl} />
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="truncate text-[16px] font-semibold text-gray-1">{post.teacherName}</p>
              <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[12px] text-gray-3">
                <span className="min-w-0 truncate">{post.school}</span>
                <span className="h-2.5 w-px shrink-0 bg-line-3" aria-hidden />
                <span className="shrink-0 tabular-nums">{formatPublishedDate(post.publishedDate)}</span>
              </p>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-2 text-[16px] font-normal leading-[1.75] text-gray-2">
            <PostTagsAboveTitle tags={post.tags} topicBadgeUrls={post.topicBadgeUrls} postId={post.id} />
            {post.title ? (
              <h3 className="mb-4 text-[20px] font-bold leading-[1.75] text-gray-1">{post.title}</h3>
            ) : null}
            <div className="whitespace-pre-wrap">{bodyText}</div>
          </div>

          <div className="shrink-0 border-t border-line-1 bg-white px-6 py-3 min-[900px]:py-4">
            <div className="flex flex-col items-center justify-center gap-2 min-[900px]:gap-2.5">
              <AnimatedLikeButton
                variant="pill"
                liked={liked}
                count={count}
                onToggle={() => toggleLike(post.id)}
                iconSize={16}
                className="shrink-0"
              />
              <p className="m-0 text-center text-[13px] leading-[1.5] text-gray-4">
                喜欢这篇的内容就点个赞吧！
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const modalHVar = 'min(880px, calc(100dvh - 64px))';
  const textColMin = 280;
  const widthBudget = `calc(100vw - 32px - ${textColMin}px)`;
  const imgColW =
    post.coverAspect === '4:3'
      ? `min(calc(var(--detail-mh) * 4 / 5), ${widthBudget})`
      : `min(calc(var(--detail-mh) * 3 / 4), ${widthBudget})`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      style={{ ['--detail-mh' as string]: modalHVar }}
      className="relative grid h-[min(880px,calc(100dvh-64px))] w-max max-w-[calc(100vw-32px)] grid-cols-[auto_minmax(280px,440px)] grid-rows-1 overflow-hidden rounded-[16px] bg-fill-light shadow-high"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 id={titleId} className="sr-only">
        {post.title ?? '帖子详情'}
      </h2>

      <section
        className="relative min-h-0 border-r border-line-1 bg-fill-gray-1"
        style={{ height: '100%', width: imgColW }}
      >
        <div
          className="group relative h-full touch-pan-y"
          onTouchStart={onSwipeTouchStart}
          onTouchEnd={onSwipeTouchEnd}
          onTouchCancel={onSwipeTouchCancel}
        >
          {mediaInner}
          {mediaList.length > 1 ? (
            <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-2">
              {mediaList.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`第 ${i + 1} 张`}
                  aria-current={i === slide}
                  className={`h-1.5 rounded-full transition-all ${
                    i === slide ? 'w-5 bg-primary-1' : 'w-1.5 bg-line-3 hover:bg-gray-3'
                  }`}
                  onClick={() => setSlide(i)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="flex min-h-0 flex-col overflow-hidden bg-white">
        <div className="flex shrink-0 items-center gap-3 px-6 py-6">
          <DetailAvatar name={post.teacherName} src={post.teacherAvatarUrl} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[16px] font-medium text-gray-1">{post.teacherName}老师</p>
            <p className="flex min-w-0 items-center gap-1.5 text-[12px] text-gray-3">
              <span className="min-w-0 truncate">{post.school}</span>
              <span className="h-2.5 w-px shrink-0 bg-line-3" aria-hidden />
              <span className="shrink-0 tabular-nums">{formatPublishedDate(post.publishedDate)}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="relative z-[25] flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fill-gray-1 text-gray-1 transition-colors hover:bg-line-1"
            aria-label="关闭"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 text-[16px] font-normal leading-[1.75] text-gray-2 min-[900px]:pt-0 min-[900px]:pb-5">
          <PostTagsAboveTitle tags={post.tags} topicBadgeUrls={post.topicBadgeUrls} postId={post.id} />
          {post.title ? (
            <h3 className="mb-4 text-[20px] font-bold leading-[1.75] text-gray-1">{post.title}</h3>
          ) : null}
          <div className="whitespace-pre-wrap">{bodyText}</div>
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center gap-2 border-t border-line-1 bg-white px-6 py-3 min-[900px]:gap-2.5 min-[900px]:py-6">
          <AnimatedLikeButton
            variant="pill"
            liked={liked}
            count={count}
            onToggle={() => toggleLike(post.id)}
            iconSize={16}
            className="shrink-0"
          />
          <p className="m-0 text-center text-[13px] leading-[1.5] text-gray-4">
            喜欢这篇的内容就点个赞吧！
          </p>
        </div>
      </section>
    </div>
  );
}

export type ArticleDetailModalProps = {
  postId: string;
  onClose: () => void;
};

export function ArticleDetailModal({ postId, onClose }: ArticleDetailModalProps) {
  const titleId = useId();
  const post = getPostById(postId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!post) {
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-8">
        <button
          type="button"
          aria-label="关闭"
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
        />
        <div
          role="dialog"
          aria-modal="true"
          className="relative w-full max-w-sm rounded-[16px] border border-line-1 bg-white p-8 text-center shadow-high"
        >
          <p className="text-[14px] text-gray-3">未找到该内容</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 h-9 w-full rounded-[18px] bg-primary-2 text-[14px] font-medium text-white hover:brightness-[0.96]"
          >
            关闭
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label="关闭"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <ArticleDetailPanel
        post={post}
        presentation="modal"
        onDismiss={onClose}
        titleId={titleId}
      />
    </div>
  );
}

/** 社区 Pad 端：全屏覆盖（含侧栏），稿式左右分栏 */
export function ArticleDetailFullPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const titleId = useId();
  const post = postId ? getPostById(postId) : undefined;

  const goList = useCallback(() => {
    navigate('/community-pad');
  }, [navigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') goList();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goList]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const portal =
    typeof document !== 'undefined'
      ? createPortal(
          !postId || !post ? (
            <div className="fixed inset-0 z-[600] flex flex-col items-center justify-center gap-4 bg-fill-gray-1 px-6">
              <p className="text-[14px] text-gray-3">未找到该内容</p>
              <button
                type="button"
                onClick={goList}
                className="h-9 rounded-[18px] bg-primary-2 px-6 text-[14px] font-medium text-white hover:brightness-[0.96]"
              >
                返回列表
              </button>
            </div>
          ) : (
            <div
              className="fixed inset-0 z-[600] flex min-h-0 flex-col overflow-hidden bg-fill-gray-1"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
            >
              <button
                type="button"
                onClick={goList}
                className="absolute z-[610] flex h-[30px] w-[30px] shrink-0 items-center justify-center overflow-hidden rounded-full border-0 bg-transparent p-0 transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-2/30 [left:calc(1rem+env(safe-area-inset-left,0px))] [top:calc(1rem+env(safe-area-inset-top,0px))]"
                aria-label="返回"
              >
                <img
                  src={publicAssetUrl('pad-nav-back.png')}
                  alt=""
                  width={30}
                  height={30}
                  className="pointer-events-none block h-[30px] w-[30px] max-h-[30px] max-w-[30px] shrink-0 select-none object-contain"
                  draggable={false}
                />
              </button>
              <ArticleDetailPanel
                post={post}
                presentation="pad"
                onDismiss={goList}
                titleId={titleId}
              />
            </div>
          ),
          document.body,
        )
      : null;

  return <>{portal}</>;
}
