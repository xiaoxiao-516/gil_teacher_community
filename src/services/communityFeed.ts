import { applyFeedCoverStagger, buildMockPostPool, resetPoolCoversFromBase } from '../data/mockPosts';
import type { CommunityPost } from '../types/community';

/** 每页条数：首屏与后续分段均为 24（对应需求中第 25–48 条为第二段） */
export const PAGE_SIZE = 24;

const pool = buildMockPostPool(96);
const postById = Object.fromEntries(pool.map((p) => [p.id, p]));

/**
 * 模拟服务端：根据最新 TVS 与「已读降权」生成用户专属排序列表。
 * 仅应在「打开社区 / 下拉刷新 / 重新进入社区模块」时调用；滑动加载只截取同一张列表。
 */
export async function runRankingAlgorithm(): Promise<string[]> {
  await new Promise((r) => setTimeout(r, 280));
  resetPoolCoversFromBase(pool);
  const scored = pool.map((p) => {
    const readPenalty = p.readDownrank ? 120 : 0;
    return { id: p.id, score: p.tvs - readPenalty };
  });
  scored.sort((a, b) => b.score - a.score);
  const ordered = scored.map((s) => postById[s.id]).filter(Boolean) as CommunityPost[];
  applyFeedCoverStagger(ordered);
  return scored.map((s) => s.id);
}

export function resolvePosts(ids: string[]): CommunityPost[] {
  return ids.map((id) => postById[id]).filter(Boolean);
}

export function getPostById(id: string): CommunityPost | undefined {
  return postById[id];
}
