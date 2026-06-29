import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 모든 플랜 조회
export const get = query({
  handler: async (ctx) => {
    return await ctx.db.query("plans").collect();
  },
});

// 플랜 등록 및 수정
export const add = mutation({
  args: {
    id: v.string(),
    brandId: v.string(),
    name: v.string(),
    funeralService: v.string(),
    refundRate: v.string(),
    depositOrg: v.string(),
    convertService: v.string(),
    membershipService: v.string(),
    maturityRound: v.number(),
    paymentSections: v.array(
      v.object({
        start: v.number(),
        end: v.number(),
        funeralAmount: v.number(),
        applianceAmount: v.number(),
      })
    ),
    notices: v.array(v.string()),
    cards: v.array(
      v.object({
        name: v.string(),
        image: v.string(),
        annualFee: v.number(),
        benefits: v.array(v.string()),
        phoneApply: v.string(),
        onlineApplyUrl: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("plans")
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .first();

    if (existing) {
      // 수정
      await ctx.db.patch(existing._id, args);
      return existing._id;
    } else {
      // 신규 등록
      return await ctx.db.insert("plans", args);
    }
  },
});

// 플랜 삭제
export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("plans")
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
        brandId: v.string(),
        name: v.string(),
        funeralService: v.string(),
        refundRate: v.string(),
        depositOrg: v.string(),
        convertService: v.string(),
        membershipService: v.string(),
        maturityRound: v.number(),
        paymentSections: v.array(
          v.object({
            start: v.number(),
            end: v.number(),
            funeralAmount: v.number(),
            applianceAmount: v.number(),
          })
        ),
        notices: v.array(v.string()),
        cards: v.array(
          v.object({
            name: v.string(),
            image: v.string(),
            annualFee: v.number(),
            benefits: v.array(v.string()),
            phoneApply: v.string(),
            onlineApplyUrl: v.string(),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const count = (await ctx.db.query("plans").collect()).length;
    if (count > 0) return; // 이미 데이터가 있으면 패스

    for (const item of args.items) {
      await ctx.db.insert("plans", item);
    }
  },
});
