import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 모든 상조사 조회
export const get = query({
  handler: async (ctx) => {
    return await ctx.db.query("brands").collect();
  },
});

// 상조사 추가
export const add = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    desc: v.string(),
    logoText: v.string(),
    fee: v.number(),
    logoUrl: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("brands")
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .first();
    if (!existing) {
      return await ctx.db.insert("brands", args);
    }
    return existing._id;
  },
});

// 상조사 삭제
export const remove = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("brands")
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

// 상조사 정보 업데이트 (어드민용)
export const update = mutation({
  args: {
    id: v.string(),
    name: v.optional(v.string()),
    desc: v.string(),
    fee: v.number(),
    logoUrl: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("brands")
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .first();

    if (!existing) {
      throw new Error(`상조사 ${args.id}를 찾을 수 없습니다.`);
    }

    const patchData = {
      desc: args.desc,
      fee: args.fee,
      logoUrl: args.logoUrl,
      color: args.color,
    };
    if (args.name) {
      patchData.name = args.name;
    }

    await ctx.db.patch(existing._id, patchData);
    return existing._id;
  },
});

// 초기 데이터 시딩
export const seed = mutation({
  args: {
    items: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        desc: v.string(),
        logoText: v.string(),
        fee: v.number(),
        logoUrl: v.optional(v.string()),
        color: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const count = (await ctx.db.query("brands").collect()).length;
    if (count > 0) return; // 이미 데이터가 있으면 시딩 패스

    for (const item of args.items) {
      await ctx.db.insert("brands", item);
    }
  },
});
