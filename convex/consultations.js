import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 모든 상담 조회
export const get = query({
  handler: async (ctx) => {
    return await ctx.db.query("consultations").collect();
  },
});

// 상담 등록
export const add = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    phone: v.string(),
    hopeItem: v.string(),
    hopeBrand: v.string(),
    purpose: v.string(),
    budget: v.string(),
    consultTime: v.string(),
    userMessage: v.string(),
    sellerId: v.string(),
    registerDate: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("consultations", args);
  },
});

// 상담 정보 수정 (처리상태 등)
export const update = mutation({
  args: {
    id: v.string(),
    status: v.string(),
    sellerId: v.optional(v.string()), // 담당자 변경 등
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("consultations")
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .first();

    if (!existing) {
      throw new Error("상담 내역을 찾을 수 없습니다.");
    }

    const updates = { status: args.status };
    if (args.sellerId !== undefined) {
      updates.sellerId = args.sellerId;
    }

    await ctx.db.patch(existing._id, updates);
    return existing._id;
  },
});

// 상담 내역 삭제
export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("consultations")
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return true;
    }
    return false;
  },
});

// 초기 데이터 시딩
export const seed = mutation({
  args: {
    items: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        phone: v.string(),
        hopeItem: v.string(),
        hopeBrand: v.string(),
        purpose: v.string(),
        budget: v.string(),
        consultTime: v.string(),
        userMessage: v.string(),
        sellerId: v.string(),
        registerDate: v.string(),
        status: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const count = (await ctx.db.query("consultations").collect()).length;
    if (count > 0) return; // 이미 데이터가 있으면 패스

    for (const item of args.items) {
      await ctx.db.insert("consultations", item);
    }
  },
});
