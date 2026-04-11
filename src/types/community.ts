export type CoverAspect = '4:3' | '3:4';

export interface CommunityPost {
  id: string;
  coverUrl: string;
  /** 未按 feed 排序错开前的基准封面；每次重算 TVS 排序时先还原再应用错开 */
  coverUrlBase: string;
  /** 详情页左侧轮播，缺省为仅封面 coverUrl */
  mediaUrls?: string[];
  /** 与 mediaUrls 对应的基准，排序错开时与 coverUrl 一并还原 */
  mediaUrlsBase?: string[];
  title?: string;
  /** 详情页右侧正文 */
  body?: string;
  teacherName: string;
  /** 老师头像，缺省为详情内首字占位 */
  teacherAvatarUrl?: string;
  school: string;
  /** 发布日期，展示用 `YYYY-MM-DD` */
  publishedDate: string;
  /**
   * 话题资源路径（如 `/tag-topic-*.svg`），用于识别「班级提分 / 学情分析 / 教学管理」；
   * 界面渲染为白底 `#` 标签。每条至少 1 个、最多 3 个；与 tags 合计最多 3 个标签位。
   */
  topicBadgeUrls: string[];
  tags: string[];
  /** 服务端基准点赞数 */
  likeCount: number;
  /** 模拟 TVS 排序分 */
  tvs: number;
  /** 是否已读（用于已读降权） */
  readDownrank: boolean;
  coverAspect: CoverAspect;
}
