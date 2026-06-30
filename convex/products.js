import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 모든 상품 조회
export const get = query({
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});

// 상품 추가 및 수정
export const add = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    categoryId: v.string(),
    modelName: v.string(),
    description: v.string(),
    thumbnail: v.string(),
    planId: v.string(),
    accounts: v.optional(v.number()),
    monthly: v.number(),
    cardBenefitPrice: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("products")
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    } else {
      return await ctx.db.insert("products", args);
    }
  },
});

// 상품 대량 일괄 추가
export const addBulk = mutation({
  args: {
    items: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        categoryId: v.string(),
        modelName: v.string(),
        description: v.string(),
        thumbnail: v.string(),
        planId: v.string(),
        accounts: v.optional(v.number()),
        monthly: v.number(),
        cardBenefitPrice: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const addedIds = [];
    for (const item of args.items) {
      // 기존 상품 ID가 있는지 확인
      const existing = await ctx.db
        .query("products")
        .withIndex("by_custom_id", (q) => q.eq("id", item.id))
        .first();
      
      if (existing) {
        await ctx.db.patch(existing._id, item);
        addedIds.push(existing._id);
      } else {
        const newId = await ctx.db.insert("products", item);
        addedIds.push(newId);
      }
    }
    return addedIds;
  },
});

// 상품 삭제
export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("products")
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
        categoryId: v.string(),
        modelName: v.string(),
        description: v.string(),
        thumbnail: v.string(),
        planId: v.string(),
        accounts: v.optional(v.number()),
        monthly: v.number(),
        cardBenefitPrice: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const count = (await ctx.db.query("products").collect()).length;
    if (count > 0) return; // 이미 데이터가 있으면 패스

    for (const item of args.items) {
      await ctx.db.insert("products", item);
    }
  },
});
