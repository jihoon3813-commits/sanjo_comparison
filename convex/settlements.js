import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 모든 정산 내역 조회
export const get = query({
  handler: async (ctx) => {
    return await ctx.db.query("settlements").collect();
  },
});

// 정산 정보 등록 및 수정
export const add = mutation({
  args: {
    id: v.string(),
    orderId: v.string(),
    sellerId: v.string(),
    customerName: v.string(),
    productName: v.string(),
    brandId: v.string(),
    brandName: v.string(),
    commission: v.number(),
    status: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settlements")
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    } else {
      return await ctx.db.insert("settlements", args);
    }
  },
});

// 정산 정보 개별 상태 업데이트
export const updateStatus = mutation({
  args: {
    id: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settlements")
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .first();

    if (!existing) {
      throw new Error("정산 내역을 찾을 수 없습니다.");
    }

    await ctx.db.patch(existing._id, { status: args.status });
    return existing._id;
  },
});

// 정산 내역 삭제
export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settlements")
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
        orderId: v.string(),
        sellerId: v.string(),
        customerName: v.string(),
        productName: v.string(),
        brandId: v.string(),
        brandName: v.string(),
        commission: v.number(),
        status: v.string(),
        date: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const count = (await ctx.db.query("settlements").collect()).length;
    if (count > 0) return; // 이미 데이터가 있으면 패스

    for (const item of args.items) {
      await ctx.db.insert("settlements", item);
    }
  },
});
