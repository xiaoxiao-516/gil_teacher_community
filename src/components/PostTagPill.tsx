/** 社区帖标签：话题整图；学科无「#」、圆角 4px、描边 1px；自由文案仍为「#」+ 深字 */

/** 统一浅蓝描边（自由文案 pill） */
const TAG_PILL_BORDER = '#DCE9FE';

const SUBJECT_TAG_LABELS = new Set([
  '数学',
  '语文',
  '英语',
  '物理',
  '化学',
  '生物',
  '历史',
  '地理',
]);

/** 是否学科标签 */
export function isSubjectTagLabel(label: string): boolean {
  return SUBJECT_TAG_LABELS.has(label);
}

/** 非学科自由文案：「#」色按种子轮换（与旧版三色逻辑一致） */
const BUSINESS_HASH_COLORS = ['#70B6FF', '#22C55E', '#818CF8'] as const;

function businessHashIndex(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % BUSINESS_HASH_COLORS.length;
}

type HashtagLabelPillProps = {
  label: string;
  hashColor: string;
  className?: string;
};

function HashtagLabelPill({ label, hashColor, className = '' }: HashtagLabelPillProps) {
  return (
    <span
      className={`box-border inline-flex max-w-full items-center gap-1 rounded-[4px] border-[1px] border-solid bg-white px-3 py-1 leading-none ${className ? ` ${className}` : ''}`}
      style={{ borderColor: TAG_PILL_BORDER }}
      aria-label={label}
    >
      <span className="shrink-0 text-[12px] font-bold" style={{ color: hashColor }}>
        #
      </span>
      <span className="min-w-0 truncate text-[12px] font-medium text-gray-2">{label}</span>
    </span>
  );
}

const SUBJECT_TAG_BORDER = '#E0EAFF';

/** 学科：无「#」，圆角 4px，描边 1px #E0EAFF */
function SubjectTagPill({ label }: { label: string }) {
  return (
    <span
      className="box-border inline-flex max-w-full items-center rounded-[4px] border-[1px] border-solid bg-white px-1.5 py-1 leading-none"
      style={{ borderColor: SUBJECT_TAG_BORDER }}
      aria-label={label}
    >
      <span className="min-w-0 truncate text-[12px] font-medium text-gray-2">{label}</span>
    </span>
  );
}

/** 与 public/tag-topic-*.svg 比例一致，用于占位与 CLS；展示高由 Tailwind 约束 */
const TOPIC_BADGE_IMG_WIDTH = 192;
const TOPIC_BADGE_IMG_HEIGHT = 54;

/** 话题位：稿面 SVG 整图，`<img>` 按高度缩放 */
export function TopicBadgeFromUrl({ src }: { src: string }) {
  return (
    <img
      src={src}
      alt=""
      width={TOPIC_BADGE_IMG_WIDTH}
      height={TOPIC_BADGE_IMG_HEIGHT}
      className="h-[22px] w-auto max-w-full shrink-0 object-contain object-left"
      draggable={false}
    />
  );
}

export type PostTagPillVariant = 'business' | 'subject';

type PostTagPillProps = {
  label: string;
  variant?: PostTagPillVariant;
  /** 非学科标签「#」色轮换种子，建议 `${postId}:${index}:${label}` */
  businessSeed?: string;
};

export function PostTagPill({ label, variant = 'business', businessSeed }: PostTagPillProps) {
  if (variant === 'subject') {
    return <SubjectTagPill label={label} />;
  }
  const hash = BUSINESS_HASH_COLORS[businessHashIndex(businessSeed ?? label)];
  return <HashtagLabelPill hashColor={hash} label={label} />;
}

/** 详情页右侧：正文标题上方的标签行 */
export function PostTagsAboveTitle({
  tags,
  topicBadgeUrls,
  className = '',
  postId = '',
}: {
  tags: string[];
  /** 与列表一致：学科前的话题，1～3 个 */
  topicBadgeUrls: string[];
  className?: string;
  /** 与列表一致的非学科标签配色随机种子 */
  postId?: string;
}) {
  if (topicBadgeUrls.length === 0 && tags.length === 0) return null;
  return (
    <div className={`mb-3 flex flex-wrap items-center gap-2${className ? ` ${className}` : ''}`}>
      {topicBadgeUrls.map((src, bidx) => (
        <TopicBadgeFromUrl key={`topic-${bidx}`} src={src} />
      ))}
      {tags.map((t, idx) => (
        <PostTagPill
          key={`${t}-${idx}`}
          label={t}
          variant={isSubjectTagLabel(t) ? 'subject' : 'business'}
          businessSeed={postId ? `${postId}:${idx}:${t}` : `${idx}:${t}`}
        />
      ))}
    </div>
  );
}
