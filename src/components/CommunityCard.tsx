import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatedLikeButton } from './AnimatedLikeButton';
import { isSubjectTagLabel, PostTagPill, TopicBadgeFromUrl } from './PostTagPill';
import { useCommunityLikes } from '../context/CommunityLikesContext';
import { isAllowedCoverUrl } from '../lib/coverValidation';
import type { CommunityPost } from '../types/community';

type CommunityCardProps = {
  post: CommunityPost;
  /** 详情路由前缀，需与当前模块一致（如 `/community`、`/community-pad`） */
  detailBase?: string;
};

export function CommunityCard({ post, detailBase = '/community' }: CommunityCardProps) {
  const navigate = useNavigate();
  const { ensureBaseline, toggleLike, getState } = useCommunityLikes();

  useEffect(() => {
    ensureBaseline(post.id, post.likeCount);
  }, [post.id, post.likeCount, ensureBaseline]);

  const { liked, count } = getState(post.id);
  const coverOk = isAllowedCoverUrl(post.coverUrl);
  const aspectClass = post.coverAspect === '4:3' ? 'aspect-[4/3]' : 'aspect-[3/4]';
  const detailPath = `${detailBase}/${post.id}`;

  /** 列表卡片：学科标签只展示第一个，避免同一卡片出现多个学科 pill */
  let subjectShown = false;
  const cardTags = post.tags.filter((t) => {
    if (isSubjectTagLabel(t)) {
      if (subjectShown) return false;
      subjectShown = true;
    }
    return true;
  });

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={post.title ? `${post.title}，进入详情` : '进入详情'}
      className="break-inside-avoid cursor-pointer overflow-hidden rounded-[12px] bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1"
      onClick={() => navigate(detailPath)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(detailPath);
        }
      }}
    >
      <div className={`relative mb-3 w-full overflow-hidden rounded-[12px] bg-fill-gray-1 ${aspectClass}`}>
        {coverOk ? (
          <img
            src={post.coverUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-4 text-center text-[12px] text-gray-4">
            <span>封面格式不支持</span>
            <span className="text-[10px]">请使用 JPG / PNG</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 px-0 pt-0 pb-2">
        {post.topicBadgeUrls.length > 0 || cardTags.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {post.topicBadgeUrls.map((src, bidx) => (
              <TopicBadgeFromUrl key={`${post.id}-topic-${bidx}`} src={src} />
            ))}
            {cardTags.map((t, idx) => (
              <PostTagPill
                key={`${t}-${idx}`}
                label={t}
                variant={isSubjectTagLabel(t) ? 'subject' : 'business'}
                businessSeed={`${post.id}:${idx}:${t}`}
              />
            ))}
          </div>
        ) : null}
        {post.title ? (
          <h3 className="m-0 pt-0 text-left text-[16px] font-semibold leading-[1.5] text-gray-1 line-clamp-2">
            {post.title}
          </h3>
        ) : null}

        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-[14px] leading-[1.5] text-gray-2">
            <span className="font-medium text-[#646b8a]">{post.teacherName}老师</span>
            <span className="mx-1 text-line-3">·</span>
            <span className="text-gray-3">{post.school}</span>
          </p>
          <AnimatedLikeButton
            liked={liked}
            count={count}
            onToggle={() => toggleLike(post.id)}
            likeEffect="minimal"
            iconSize={18}
            stopPropagation
            className="gap-1.5 rounded-[12px] px-2 py-1 text-[14px] font-medium text-gray-3 transition-colors"
          />
        </div>
      </div>
    </article>
  );
}
