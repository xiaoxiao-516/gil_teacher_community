import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/** 更饱满的 24×24 心形（偏圆润） */
const HEART_D =
  'M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.082 3 7.172 3c1.61 0 3.198.755 4.828 2.375C13.63 3.755 15.218 3 16.828 3 19.918 3 21.75 5.322 21.75 8.25c0 3.924-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17l-.022.012-.007.003-.003.001a.752.752 0 0 1-.606 0l-.003-.001z';

type FloatingHeart = {
  id: number;
  ox: number;
  oy: number;
  x: number;
  y: number;
  s0: number;
  s1: number;
  dur: number;
  del: number;
  size: number;
};

type AnimatedLikeButtonProps = {
  liked: boolean;
  count: number;
  onToggle: () => void;
  /** ghost：透明底；primary：品牌蓝胶囊；pill：浅灰圆角条（详情页底部文案+赞） */
  variant?: 'ghost' | 'primary' | 'pill';
  /**
   * full：心放大变红 + 飘散粒子 + 数字弹动（详情等）
   * minimal：仅心放大变红（瀑布流卡片）
   */
  likeEffect?: 'full' | 'minimal';
  /** 图标边长 px */
  iconSize?: number;
  /** 卡片内点击时阻止冒泡 */
  stopPropagation?: boolean;
  className?: string;
  'aria-pressed'?: boolean;
};

export function AnimatedLikeButton({
  liked,
  count,
  onToggle,
  variant = 'ghost',
  likeEffect = 'full',
  iconSize = 18,
  stopPropagation = false,
  className = '',
  'aria-pressed': ariaPressed,
}: AnimatedLikeButtonProps) {
  const [heartPlaying, setHeartPlaying] = useState(false);
  const [countPlaying, setCountPlaying] = useState(false);
  const [floaters, setFloaters] = useState<FloatingHeart[]>([]);
  const floaterIdRef = useRef(0);
  const showParticles = likeEffect === 'full';
  const instanceUid = useId();
  const heartGradId = `like-hg-${instanceUid.replace(/:/g, '')}`;

  useEffect(() => {
    if (!liked) {
      setHeartPlaying(false);
      setCountPlaying(false);
    }
  }, [liked]);

  const spawnFloatingHearts = (originX: number, originY: number) => {
    const n = Math.max(6, Math.round((8 + Math.floor(Math.random() * 5)) * 0.9));
    const batch: FloatingHeart[] = [];
    const spreadW = 72;
    const denom = Math.max(n - 1, 1);
    for (let i = 0; i < n; i++) {
      const slotX = ((i - (n - 1) / 2) * spreadW) / denom;
      const jitterX = (Math.random() - 0.5) * 16;
      batch.push({
        id: floaterIdRef.current++,
        ox: originX,
        oy: originY,
        x: slotX + jitterX,
        y: -(88 + Math.random() * 112),
        s0: 0.55 + Math.random() * 0.75,
        s1: 0.2 + Math.random() * 0.35,
        dur: 0.82 + Math.random() * 0.48,
        del: Math.random() * 0.14,
        size: 18 + Math.floor(Math.random() * 16),
      });
    }
    const ids = new Set(batch.map((b) => b.id));
    setFloaters((prev) => [...prev, ...batch]);
    window.setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => !ids.has(f.id)));
    }, 2600);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) e.stopPropagation();
    if (!liked) {
      setHeartPlaying(true);
      if (showParticles) {
        setCountPlaying(true);
        const r = e.currentTarget.getBoundingClientRect();
        spawnFloatingHearts(r.left + r.width / 2, r.top + r.height / 2);
      }
    }
    onToggle();
  };

  const pathClass =
    heartPlaying
      ? 'like-heart-path'
      : liked
        ? 'like-heart-path like-heart-path--liked'
        : 'like-heart-path like-heart-path--outline';

  const ghostCls =
    'inline-flex shrink-0 items-center bg-transparent outline-none ring-0 [-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:outline-none focus-visible:ring-0 ' +
    (liked
      ? 'hover:bg-transparent active:bg-transparent'
      : 'hover:bg-fill-gray-1 active:bg-transparent');

  const primaryCls =
    'like-btn--primary inline-flex min-h-9 min-w-[76px] shrink-0 items-center justify-center gap-2 rounded-[18px] bg-primary-2 px-5 py-2 text-[14px] font-medium leading-[1.5] text-white outline-none ring-0 [-webkit-tap-highlight-color:transparent] transition-[filter] focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-2/35 hover:brightness-[0.96] active:brightness-[0.9]';

  const pillCls =
    'inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#F4F7FE] px-4 py-2 text-[14px] font-medium leading-none text-gray-2 outline-none ring-0 [-webkit-tap-highlight-color:transparent] transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-2/25 hover:bg-line-1 active:bg-[#F4F7FE]';

  const variantCls =
    variant === 'primary' ? primaryCls : variant === 'pill' ? pillCls : ghostCls;

  const svgDisplaySize = Math.round(iconSize * (liked && !heartPlaying ? 1.12 : 1));

  const portal =
    showParticles && typeof document !== 'undefined' && floaters.length > 0
      ? createPortal(
          floaters.map((f) => (
            <span
              key={`${instanceUid}-f-${f.id}`}
              className="like-floating-heart-particle"
              style={
                {
                  left: f.ox,
                  top: f.oy,
                  '--lf-x': `${f.x}px`,
                  '--lf-y': `${f.y}px`,
                  '--lf-s0': f.s0,
                  '--lf-s1': f.s1,
                  animation: `like-floating-heart-particle ${f.dur}s cubic-bezier(0.22, 0.61, 0.36, 1) ${f.del}s forwards`,
                } as React.CSSProperties
              }
              aria-hidden
            >
              <svg
                width={f.size}
                height={f.size}
                viewBox="0 0 24 24"
                className="block drop-shadow-[0_1px_2px_rgba(250,90,87,0.35)]"
              >
                <defs>
                  <linearGradient
                    id={`${heartGradId}-f-${f.id}`}
                    x1="3"
                    y1="2"
                    x2="21"
                    y2="22"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#ff9494" />
                    <stop offset="48%" stopColor="#fa5a57" />
                    <stop offset="100%" stopColor="#e8384a" />
                  </linearGradient>
                </defs>
                <path fill={`url(#${heartGradId}-f-${f.id})`} d={HEART_D} />
              </svg>
            </span>
          )),
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`relative overflow-visible ${variantCls} ${className}`.trim()}
        aria-pressed={ariaPressed ?? liked}
      >
        <span
          className={
            heartPlaying
              ? showParticles
                ? 'like-heart-wrap--animate'
                : 'like-heart-wrap--minimal'
              : `inline-flex transition-[width,height] duration-200 ease-out`
          }
          onAnimationEnd={() => setHeartPlaying(false)}
        >
          <svg
            width={svgDisplaySize}
            height={svgDisplaySize}
            viewBox="0 0 24 24"
            className="block shrink-0"
            aria-hidden
          >
            <defs>
              <linearGradient
                id={heartGradId}
                x1="3"
                y1="2"
                x2="21"
                y2="22"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#ff9494" />
                <stop offset="48%" stopColor="#fa5a57" />
                <stop offset="100%" stopColor="#e8384a" />
              </linearGradient>
            </defs>
            <path
              className={pathClass}
              d={HEART_D}
              fill={liked && !heartPlaying ? `url(#${heartGradId})` : undefined}
            />
          </svg>
        </span>
        <span
          className={
            countPlaying && showParticles ? 'like-count--animate tabular-nums' : 'tabular-nums'
          }
          onAnimationEnd={() => setCountPlaying(false)}
        >
          {count}
        </span>
      </button>
      {portal}
    </>
  );
}
