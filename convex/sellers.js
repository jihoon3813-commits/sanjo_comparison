import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 모든 셀러 조회
export const get = query({
  handler: async (ctx) => {
    return await ctx.db.query("sellers").collect();
  },
});

// 셀러 가입 / 추가
export const add = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    phone: v.string(),
    address: v.string(),
    username: v.string(),
    password: v.string(),
    subdomain: v.string(),
    status: v.string(),
    registerDate: v.string(),
  },
  handler: async (ctx, args) => {
    // 중복 체크
    const dupUsername = await ctx.db
      .query("sellers")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (dupUsername) {
      throw new Error("이미 사용 중인 로그인 ID입니다.");
    }

    const dupSubdomain = await ctx.db
      .query("sellers")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", args.subdomain))
      .first();

    if (dupSubdomain) {
      throw new Error("이미 사용 중인 서브도메인입니다.");
    }

    return await ctx.db.insert("sellers", args);
  },
});

// 셀러 정보 수정 (어드민용 또는 상태 변경용)
export const update = mutation({
  args: {
    id: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    password: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("sellers")
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .first();

    if (!existing) {
      throw new Error("셀러를 찾을 수 없습니다.");
    }

    const updates = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.address !== undefined) updates.address = args.address;
    if (args.password !== undefined) updates.password = args.password;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(existing._id, updates);
    return existing._id;
  },
});

// 셀러 삭제
export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("sellers")
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
        address: v.string(),
        username: v.string(),
        password: v.string(),
        subdomain: v.string(),
        status: v.string(),
        registerDate: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const count = (await ctx.db.query("sellers").collect()).length;
    if (count > 0) return; // 이미 데이터가 있으면 패스

    for (const item of args.items) {
      await ctx.db.insert("sellers", item);
    }
  },
});
