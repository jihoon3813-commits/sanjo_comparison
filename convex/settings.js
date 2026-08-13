import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Key 기반 설정 조회
export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("site_settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    return setting ? setting.value : null;
  },
});

// Key 기반 설정 추가 및 수정
export const set = mutation({
  args: {
    key: v.string(),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("site_settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value });
      return existing._id;
    } else {
      return await ctx.db.insert("site_settings", {
        key: args.key,
        value: args.value,
      });
    }
  },
});
