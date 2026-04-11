import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type LikesContextValue = {
  liked: Record<string, boolean>;
  count: Record<string, number>;
  /** 首次展示卡片时写入服务端基准点赞数 */
  ensureBaseline: (id: string, serverCount: number) => void;
  toggleLike: (id: string) => void;
  getState: (id: string) => { liked: boolean; count: number };
};

const CommunityLikesContext = createContext<LikesContextValue | null>(null);

export function CommunityLikesProvider({ children }: { children: ReactNode }) {
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [count, setCount] = useState<Record<string, number>>({});

  const ensureBaseline = useCallback((id: string, serverCount: number) => {
    setCount((c) => (c[id] !== undefined ? c : { ...c, [id]: serverCount }));
    setLiked((l) => (l[id] !== undefined ? l : { ...l, [id]: false }));
  }, []);

  const toggleLike = useCallback((id: string) => {
    setLiked((prev) => {
      const wasLiked = !!prev[id];
      setCount((c) => {
        const base = c[id] ?? 0;
        const delta = wasLiked ? -1 : 1;
        return { ...c, [id]: Math.max(0, base + delta) };
      });
      return { ...prev, [id]: !wasLiked };
    });
  }, []);

  const getState = useCallback(
    (id: string) => ({
      liked: !!liked[id],
      count: count[id] ?? 0,
    }),
    [liked, count],
  );

  const value = useMemo(
    () => ({
      liked,
      count,
      ensureBaseline,
      toggleLike,
      getState,
    }),
    [liked, count, ensureBaseline, toggleLike, getState],
  );

  return (
    <CommunityLikesContext.Provider value={value}>{children}</CommunityLikesContext.Provider>
  );
}

export function useCommunityLikes() {
  const ctx = useContext(CommunityLikesContext);
  if (!ctx) throw new Error('useCommunityLikes must be used within CommunityLikesProvider');
  return ctx;
}
