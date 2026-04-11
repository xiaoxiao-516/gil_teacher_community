import type { CommunityPost } from '../types/community';

/** 较长正文示例（相对默认短文更长） */
function longBodyForMock(): string {
  return [
    '1. 操作要点：对齐目标与学情，匹配活动与评价方式。',
    '2. 课堂建议：讲练穿插、即时反馈，关注全体与个别差异。',
    '3. 复盘迭代：结合数据与反思记录，优化下一轮设计。',
    '',
    '【课堂记录】本课以前置两题暴露迷思，再以探究单引导用证据修正；中段限时自检，按正确率决定是否插入追问。小组讨论后代表投屏讲思路，教师点评表述与逻辑。下课前一句话总结与一道迁移题；作业分基础与拓展，附要点与自评量规。',
    '【数据与协同】平板采集过程与结果，生成掌握热力图；科组可调同题各班对比。课后三天内完成回访一条，视情况补学微课。家长端同步重难点；班主任协同保障节奏。',
    '【补充】本周推送 6 分钟微课巩固易错点；请假学生可补看板书照片并完成在线两道巩固题，教师周二前批改反馈。',
    '【备注】信息组需提前巡检账号与网络，避免课中签到异常；实验课材料按组分装，铃响前完成发放与安全教育。',
    '【归档】本课 PPT 与学案已上传科组云盘，供平行班参考微调后使用。',
  ].join('\n');
}

/** public 根目录下中文文件名的封面路径 */
function coverAsset(filename: string): string {
  return `/${encodeURIComponent(filename)}`;
}

/** 实拍横图 4:3（图片-1～4），按帖索引轮换，列表每行视觉上会依次穿插 */
const STOCK_HORIZONTAL_COVERS: string[] = [
  coverAsset('图片-1.png'),
  coverAsset('图片-2.png'),
  coverAsset('图片-3.png'),
  coverAsset('图片-4.png'),
];

/** 实拍竖图 3:4（图片-5～7） */
const STOCK_VERTICAL_COVERS: string[] = [
  coverAsset('图片-5.png'),
  coverAsset('图片-6.png'),
  coverAsset('图片-7.png'),
];

/** 略大于最大列数，并覆盖「隔行」近似邻居，减轻瀑布流同图扎堆 */
const FEED_COVER_LOOKBACK = 7;

/** 从池里从 startIndex 起找第一张不在 avoid 集合中的图（用于相邻帖错开、多图去重） */
function pickFromPoolAvoiding(
  pool: readonly string[],
  startIndex: number,
  avoid?: ReadonlySet<string>,
): string {
  const n = pool.length;
  for (let k = 0; k < n; k++) {
    const url = pool[(startIndex + k) % n]!;
    if (!avoid || !avoid.has(url)) return url;
  }
  return pool[startIndex % n]!;
}

/** 排序前还原为基准封面/轮播，避免多次刷新叠加错开 */
export function resetPoolCoversFromBase(pool: CommunityPost[]): void {
  for (const p of pool) {
    p.coverUrl = p.coverUrlBase;
    if (p.mediaUrlsBase !== undefined) {
      p.mediaUrls = [...p.mediaUrlsBase];
    } else {
      p.mediaUrls = undefined;
    }
  }
}

/** 高光横图：首条与 TVS 序常见首帖 i=0、i=30 */
const HIGHLIGHT_COVER_I0 = coverAsset('横-1-1.png');
const HIGHLIGHT_COVER_I30 = coverAsset('横-1-2.png');

/** 横版学科头图（横-2 数学小白系列），按学科配色区分 */
const THEMED_HORIZONTAL_BY_SUBJECT = {
  语文: coverAsset('横-2-1.png'),
  英语: coverAsset('横-2-2.png'),
  数学: coverAsset('横-2-3.png'),
  化学: coverAsset('横-2-4.png'),
  物理: coverAsset('横-2-5.png'),
  生物: coverAsset('横-2-6.png'),
} as const;

type ThemedHorizontalSubject = keyof typeof THEMED_HORIZONTAL_BY_SUBJECT;

function isThemedHorizontalSubject(s: string): s is ThemedHorizontalSubject {
  return Object.prototype.hasOwnProperty.call(THEMED_HORIZONTAL_BY_SUBJECT, s);
}

/** 横版：如何规划一天的学习时间（横-3），固定挂 post-9 / i=8 */
const PLAN_DAILY_STUDY_COVER = coverAsset('横-3-1.png');

/** 竖版：如何规划一天的学习时间（竖-3） */
const VERTICAL_PLAN_STUDY_BY_SUBJECT = {
  语文: coverAsset('竖-3-1.png'),
  化学: coverAsset('竖-3-2.png'),
  英语: coverAsset('竖-3-1.png'),
} as const;

/** 竖图帖索引与学科封面：i=7→语文，i=11→化学，i=19→英语 */
const VERTICAL_PLAN_STUDY_INDICES: Record<number, keyof typeof VERTICAL_PLAN_STUDY_BY_SUBJECT> = {
  7: '语文',
  11: '化学',
  19: '英语',
};

/** 竖图占位（原 i=59）：竖-1 拉开差距系列 */
const VERTICAL_SPOTLIGHT_COVER = coverAsset('竖-1-7.png');

const THEMED_HORIZONTAL_VARIANT_LIST: string[] = [
  THEMED_HORIZONTAL_BY_SUBJECT.语文,
  THEMED_HORIZONTAL_BY_SUBJECT.英语,
  THEMED_HORIZONTAL_BY_SUBJECT.数学,
  THEMED_HORIZONTAL_BY_SUBJECT.化学,
  THEMED_HORIZONTAL_BY_SUBJECT.物理,
  THEMED_HORIZONTAL_BY_SUBJECT.生物,
];

/** 与列表卡片同朝向的可替换头图（实拍 + 数学小白横-2 等设计稿），用于去重时不必只换回图片-1～4 */
const HORIZONTAL_REPLACE_POOL: string[] = [
  ...new Set([
    ...STOCK_HORIZONTAL_COVERS,
    ...THEMED_HORIZONTAL_VARIANT_LIST,
    PLAN_DAILY_STUDY_COVER,
    HIGHLIGHT_COVER_I0,
    HIGHLIGHT_COVER_I30,
    ...Array.from({ length: 9 }, (_, j) => coverAsset(`横-1-${j + 1}.png`)),
    ...Array.from({ length: 5 }, (_, j) => coverAsset(`横-3-${j + 1}.png`)),
  ]),
];

const VERTICAL_REPLACE_POOL: string[] = [
  ...new Set([
    ...STOCK_VERTICAL_COVERS,
    VERTICAL_SPOTLIGHT_COVER,
    ...Object.values(VERTICAL_PLAN_STUDY_BY_SUBJECT),
    ...Array.from({ length: 9 }, (_, j) => coverAsset(`竖-1-${j + 1}.png`)),
    ...Array.from({ length: 8 }, (_, j) => coverAsset(`竖-2-${j + 1}.png`)),
  ]),
];

function replacePoolForAspect(aspect: '4:3' | '3:4'): readonly string[] {
  return aspect === '4:3' ? HORIZONTAL_REPLACE_POOL : VERTICAL_REPLACE_POOL;
}

type MasonryPlacement = { index: number; col: number; y0: number; y1: number };

/** 与 CommunityPage 瀑布流一致：按最短列填充，高度仅用于估算邻接关系 */
function assignMasonryPlacements(posts: CommunityPost[], columnCount: number): MasonryPlacement[] {
  const colY: number[] = Array.from({ length: columnCount }, () => 0);
  const out: MasonryPlacement[] = [];
  for (let i = 0; i < posts.length; i++) {
    const h = posts[i]!.coverAspect === '4:3' ? 10 : 13;
    let col = 0;
    for (let c = 1; c < columnCount; c++) {
      if (colY[c]! < colY[col]!) col = c;
    }
    const y0 = colY[col]!;
    colY[col] = y0 + h;
    out.push({ index: i, col, y0, y1: y0 + h });
  }
  return out;
}

/** 同列上下相邻 + 邻列纵向重叠，视为界面上「挨着」的卡片 */
function visualNeighborIndicesByMasonry(
  posts: CommunityPost[],
  columnCount: number,
): Map<number, Set<number>> {
  const pl = assignMasonryPlacements(posts, columnCount);
  const map = new Map<number, Set<number>>();
  for (const a of pl) {
    const ns = new Set<number>();
    for (const b of pl) {
      if (a.index === b.index) continue;
      if (Math.abs(a.col - b.col) > 1) continue;
      if (a.y0 < b.y1 && b.y0 < a.y1) ns.add(b.index);
    }
    map.set(a.index, ns);
  }
  return map;
}

/** 2/3/4 列并集：避免窄屏与宽屏下「视觉邻居」判断不一致 */
function mergedVisualNeighborIndices(posts: CommunityPost[]): Map<number, Set<number>> {
  const m2 = visualNeighborIndicesByMasonry(posts, 2);
  const m3 = visualNeighborIndicesByMasonry(posts, 3);
  const m4 = visualNeighborIndicesByMasonry(posts, 4);
  const merged = new Map<number, Set<number>>();
  for (let i = 0; i < posts.length; i++) {
    const s = new Set<number>();
    for (const j of m2.get(i) ?? []) s.add(j);
    for (const j of m3.get(i) ?? []) s.add(j);
    for (const j of m4.get(i) ?? []) s.add(j);
    merged.set(i, s);
  }
  return merged;
}

/** 多图帖：辅图用实拍池，与主图不重复 */
function refreshMediaUrlsForPost(post: CommunityPost, salt: number): void {
  if (!post.mediaUrls?.length) return;
  const pool = post.coverAspect === '4:3' ? STOCK_HORIZONTAL_COVERS : STOCK_VERTICAL_COVERS;
  const usedInPost = new Set<string>([post.coverUrl]);
  const s1 = pickFromPoolAvoiding(pool, salt + 11, usedInPost);
  usedInPost.add(s1);
  const s2 = pickFromPoolAvoiding(pool, salt + 22, usedInPost);
  post.mediaUrls = [post.coverUrl, s1, s2];
}

function fixConsecutiveDuplicateCovers(posts: CommunityPost[]): void {
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < posts.length - 1; i++) {
      if (posts[i]!.coverUrl !== posts[i + 1]!.coverUrl) continue;
      const nxt = posts[i + 1]!;
      const pool = replacePoolForAspect(nxt.coverAspect);
      const avoid = new Set<string>([posts[i]!.coverUrl]);
      if (i + 2 < posts.length) avoid.add(posts[i + 2]!.coverUrl);
      nxt.coverUrl = pickFromPoolAvoiding(pool, i * 97 + 41 + pass * 17, avoid);
      refreshMediaUrlsForPost(nxt, i + 1 + pass);
    }
  }
}

/**
 * TVS 排序后错开封面：兼顾「列表顺序前若干条」与「瀑布流 4 列下的视觉邻居」，
 * 设计稿头图（如横-2 数学小白）重复时可在横图替换池内换另一张设计/实拍。
 */
export function applyFeedCoverStagger(posts: CommunityPost[]): void {
  const visualNeighbors = mergedVisualNeighborIndices(posts);
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i < posts.length; i++) {
      const cur = posts[i]!;
      const avoid = new Set<string>();
      for (const j of visualNeighbors.get(i) ?? []) {
        avoid.add(posts[j]!.coverUrl);
      }
      for (let j = Math.max(0, i - FEED_COVER_LOOKBACK); j < i; j++) {
        avoid.add(posts[j]!.coverUrl);
      }
      if (!avoid.has(cur.coverUrl)) continue;

      const pool = replacePoolForAspect(cur.coverAspect);
      cur.coverUrl = pickFromPoolAvoiding(pool, i * 59 + 7 + pass * 13, avoid);
      refreshMediaUrlsForPost(cur, i + pass);
    }
  }
  fixConsecutiveDuplicateCovers(posts);
}

const schools = ['杭州市文澜中学', '上海实验学校', '北京四中', '深圳南山外国语', '成都七中'];
const names = ['宋萍', '王磊', '李婷', '陈浩', '赵敏', '周洋'];

/** 与老师索引一致的头像 seed（同一名师多帖共用头像） */
function teacherAvatarUrlForIndex(i: number): string {
  const teacherSeed = `tface${i % names.length}`;
  return `https://picsum.photos/seed/${teacherSeed}/96/96.jpg`;
}

/** 帖卡片仅展示学科标签（PostTagPill subject 样式） */
const SUBJECT_TAGS = [
  '语文',
  '数学',
  '英语',
  '物理',
  '化学',
  '生物',
  '历史',
  '地理',
] as const;

function pick<T>(arr: readonly T[] | T[], i: number): T {
  return arr[i % arr.length];
}

/** 与帖子索引绑定的 32 位哈希：标签条数与文案稳定随机（刷新不变） */
function seededUInt(i: number): number {
  let x = i + 1;
  x = ((x >> 16) ^ x) * 0x45d9f3b;
  x = ((x >> 16) ^ x) * 0x45d9f3b;
  x = (x >> 16) ^ x;
  return x >>> 0;
}

/** 话题标识路径（public 下 PNG 整图；列表/详情直接 `<img>` 展示）；?v= 用于替换高清资源后刷新缓存 */
const TOPIC_BADGE_ASSET_VER = '3';
const TOPIC_BADGE_URLS = [
  `/tag-topic-class-score.svg?v=${TOPIC_BADGE_ASSET_VER}`,
  `/tag-topic-learning-analysis.svg?v=${TOPIC_BADGE_ASSET_VER}`,
  `/tag-topic-teaching-mgmt.svg?v=${TOPIC_BADGE_ASSET_VER}`,
] as const;

function topicPermutation(seed: number): [number, number, number] {
  const o: [number, number, number] = [0, 1, 2];
  if (seed & 1) [o[0], o[1]] = [o[1], o[0]];
  if (seed & 2) [o[1], o[2]] = [o[2], o[1]];
  if (seed & 4) [o[0], o[2]] = [o[2], o[0]];
  if (seed & 8) [o[0], o[1]] = [o[1], o[0]];
  return o;
}

function pickDistinctSubjects(i: number, count: number): string[] {
  if (count <= 0) return [];
  const out: string[] = [];
  let salt = 0;
  while (out.length < count && salt < 40) {
    const cand = pick(SUBJECT_TAGS, i + out.length * 17 + salt * 31);
    if (!out.includes(cand)) out.push(cand);
    salt++;
  }
  return out;
}

/** 话题图 1～3 个 + 学科，合计展示位 ≤3；每条至少 1 个话题图 */
function topicBadgeUrlsAndTagsForIndex(i: number): { topicBadgeUrls: string[]; tags: string[] } {
  const h = seededUInt(i ^ 0x9e3779b9);
  const nTopic = (h % 3) + 1;
  const maxSub = 3 - nTopic;
  const nSubject = maxSub === 0 ? 0 : seededUInt(i + 555) % (maxSub + 1);
  const perm = topicPermutation((h >>> 8) ^ (h >>> 16));
  const topicBadgeUrls = perm.slice(0, nTopic).map((idx) => TOPIC_BADGE_URLS[idx]);
  const tags = pickDistinctSubjects(i, nSubject);
  return { topicBadgeUrls, tags };
}

/** 按索引生成稳定、可读的模拟发布日期 */
function publishedDateForIndex(i: number): string {
  const base = new Date(2024, 0, 8);
  base.setDate(base.getDate() + (i * 5) % 200);
  const y = base.getFullYear();
  const m = String(base.getMonth() + 1).padStart(2, '0');
  const d = String(base.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 生成可排序的模拟池（数量 > 48 以便验证分页） */
export function buildMockPostPool(size = 96): CommunityPost[] {
  const posts: CommunityPost[] = [];
  let prevMainCover: string | undefined;
  /** 横/竖实拍各自严格递增轮换，与帖子下标 i 解耦，列表里图片更「穿插」 */
  let horizStockSeq = 0;
  let vertStockSeq = 0;
  for (let i = 0; i < size; i++) {
    /** 以横图 4:3 为主，每第 4 条为竖图 3:4（第 4、8、12…条） */
    const aspect: '4:3' | '3:4' = (i + 1) % 4 === 0 ? '3:4' : '4:3';
    let { topicBadgeUrls, tags } = topicBadgeUrlsAndTagsForIndex(i);
    if (i === 0) {
      topicBadgeUrls = [TOPIC_BADGE_URLS[2], TOPIC_BADGE_URLS[1]];
      tags = ['数学'];
    }
    if (i === 30) {
      topicBadgeUrls = [TOPIC_BADGE_URLS[2]];
      tags = ['生物'];
    }

    const subjectTag =
      tags.find((t) => isThemedHorizontalSubject(t)) ?? tags[0] ?? pick(SUBJECT_TAGS, i + 3);
    const themedHorizontalUrl =
      aspect === '4:3' && subjectTag && isThemedHorizontalSubject(subjectTag)
        ? THEMED_HORIZONTAL_BY_SUBJECT[subjectTag]
        : undefined;
    const themedVertical = VERTICAL_PLAN_STUDY_INDICES[i];
    const nextStockDefault = (): string =>
      aspect === '4:3'
        ? STOCK_HORIZONTAL_COVERS[horizStockSeq++ % STOCK_HORIZONTAL_COVERS.length]!
        : STOCK_VERTICAL_COVERS[vertStockSeq++ % STOCK_VERTICAL_COVERS.length]!;
    let mainCover =
      i === 0
        ? HIGHLIGHT_COVER_I0
        : i === 30
          ? HIGHLIGHT_COVER_I30
          : i === 8
            ? PLAN_DAILY_STUDY_COVER
            : i === 59
              ? VERTICAL_SPOTLIGHT_COVER
              : themedVertical
                ? VERTICAL_PLAN_STUDY_BY_SUBJECT[themedVertical]
                : themedHorizontalUrl ?? nextStockDefault();

    /** 与上一条主封面相同则在同朝向实拍池内顺延选图，避免列表相邻重复 */
    const stockPool = aspect === '4:3' ? STOCK_HORIZONTAL_COVERS : STOCK_VERTICAL_COVERS;
    if (prevMainCover !== undefined && mainCover === prevMainCover) {
      mainCover = pickFromPoolAvoiding(stockPool, i + 17, new Set([prevMainCover]));
    }
    prevMainCover = mainCover;

    /** 约 1/3 条带多图；辅图用稳定 salt 与主图错开 */
    const mediaUrls =
      i % 3 === 0
        ? (() => {
            const usedInPost = new Set<string>([mainCover]);
            const s1 = pickFromPoolAvoiding(stockPool, i * 3 + 1, usedInPost);
            usedInPost.add(s1);
            const s2 = pickFromPoolAvoiding(stockPool, i * 3 + 2, usedInPost);
            return [mainCover, s1, s2];
          })()
        : undefined;
    posts.push({
      id: `post-${i + 1}`,
      coverUrl: mainCover,
      coverUrlBase: mainCover,
      mediaUrls,
      mediaUrlsBase: mediaUrls ? [...mediaUrls] : undefined,
      /** 每 6 条一条较长 body，便于对比列表展示 */
      body: i % 6 === 0 ? longBodyForMock() : undefined,
      title:
        /* TVS 排序后首条常为 i=30（post-31，宋萍）；i=0 为池中第一条宋萍 */
        i === 0 || i === 30
          ? '平板教学实践 · 从课堂到学情闭环'
          : i === 8 || themedVertical
            ? '如何规划一天的学习时间？'
            : i % 5 === 0
            ? undefined
            : i % 3 === 0
              ? '这是一段可能非常长的标题用于测试两行截断与省略号展示效果'
              : '课堂实录 · 探究式学习',
      teacherName: pick(names, i),
      teacherAvatarUrl: teacherAvatarUrlForIndex(i),
      school: pick(schools, i),
      publishedDate: publishedDateForIndex(i),
      topicBadgeUrls,
      tags,
      likeCount: 12 + (i * 7) % 200,
      tvs: 500 + (i * 13) % 400 + (i % 17) * 10,
      readDownrank: i % 11 === 0,
      coverAspect: aspect,
    });
  }
  return posts;
}
