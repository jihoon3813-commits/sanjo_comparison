import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 방문 로그 기록
export const record = mutation({
  args: {
    id: v.string(),
    ip: v.string(),
    page: v.string(),
    pageTitle: v.optional(v.string()),
    referrer: v.string(),
    referrerUrl: v.optional(v.string()),
    sellerId: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    device: v.string(),
    browser: v.optional(v.string()),
    os: v.optional(v.string()),
    timestamp: v.string(),
    date: v.string(),
    hour: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("visits", args);
  },
});

// 방문 로그 조회 (날짜 범위 지원)
export const get = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let all = await ctx.db.query("visits").collect();
    if (args.startDate && args.endDate) {
      all = all.filter((item) => item.date >= args.startDate && item.date <= args.endDate);
    } else if (args.startDate) {
      all = all.filter((item) => item.date >= args.startDate);
    } else if (args.endDate) {
      all = all.filter((item) => item.date <= args.endDate);
    }
    // Sort descending by timestamp
    return all.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
  },
});

// 단일 방문 로그 삭제
export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("visits")
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return true;
    }
    return false;
  },
});

// 전체 방문 로그 초기화
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("visits").collect();
    for (const v of all) {
      await ctx.db.delete(v._id);
    }
    return true;
  },
});

// 과거 샘플 데이터 시딩 (DB가 비어있을 때 관리자 테스트용)
export const seed = mutation({
  args: {
    items: v.array(
      v.object({
        id: v.string(),
        ip: v.string(),
        page: v.string(),
        pageTitle: v.optional(v.string()),
        referrer: v.string(),
        referrerUrl: v.optional(v.string()),
        sellerId: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        device: v.string(),
        browser: v.optional(v.string()),
        os: v.optional(v.string()),
        timestamp: v.string(),
        date: v.string(),
        hour: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const count = (await ctx.db.query("visits").collect()).length;
    if (count > 0) return; // 이미 데이터가 있으면 건너뜀

    for (const item of args.items) {
      await ctx.db.insert("visits", item);
    }
  },
});
