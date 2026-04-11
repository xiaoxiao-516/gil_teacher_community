import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CommunityPost } from '../types/community';
import { PAGE_SIZE, resolvePosts, runRankingAlgorithm } from '../services/communityFeed';

type FeedContextValue = {
  posts: CommunityPost[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  hasMore: boolean;
  /** 重新跑排序算法并加载第一页 */
  refreshFeed: () => Promise<void>;
  /** 从当前用户的排序列表截取下一页（不重新跑算法） */
  loadMore: () => void;
};

const CommunityFeedContext = createContext<FeedContextValue | null>(null);

let feedSessionBootstrapped = false;

/** 离开社区模块时调用，使下次进入重新生成排序列表 */
export function resetCommunityFeedSession() {
  feedSessionBootstrapped = false;
}

export function CommunityFeedProvider({ children }: { children: ReactNode }) {
  const [sortedIds, setSortedIds] = useState<string[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const posts = useMemo(
    () => resolvePosts(sortedIds.slice(0, loadedCount)),
    [sortedIds, loadedCount],
  );

  const hasMore = loadedCount < sortedIds.length;

  const refreshFeed = useCallback(async () => {
    setError(null);
    setRefreshing(true);
    setLoading(true);
    try {
      const ids = await runRankingAlgorithm();
      setSortedIds(ids);
      setLoadedCount(Math.min(PAGE_SIZE, ids.length));
    } catch {
      setError('加载失败，请重试');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (loadedCount >= sortedIds.length) return;
    setLoadedCount((n) => Math.min(n + PAGE_SIZE, sortedIds.length));
  }, [loadedCount, sortedIds.length]);

  useEffect(() => {
    if (feedSessionBootstrapped) return;
    feedSessionBootstrapped = true;
    void refreshFeed();
  }, [refreshFeed]);

  const value = useMemo(
    () => ({
      posts,
      loading,
      refreshing,
      error,
      hasMore,
      refreshFeed,
      loadMore,
    }),
    [posts, loading, refreshing, error, hasMore, refreshFeed, loadMore],
  );

  return (
    <CommunityFeedContext.Provider value={value}>{children}</CommunityFeedContext.Provider>
  );
}

export function useCommunityFeed() {
  const ctx = useContext(CommunityFeedContext);
  if (!ctx) throw new Error('useCommunityFeed must be used within CommunityFeedProvider');
  return ctx;
}
