import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  brands: defineTable({
    id: v.string(), // custom id (e.g. 'daemyung')
    name: v.string(),
    desc: v.string(),
    logoText: v.string(),
    fee: v.number(),
    logoUrl: v.optional(v.string()),
    color: v.optional(v.string()),
  }).index("by_custom_id", ["id"]),

  plans: defineTable({
    id: v.string(), // custom id (e.g. 'plan_daemyung_429')
    brandId: v.string(), // references brands.id
    name: v.string(),
    funeralService: v.union(v.string(), v.array(v.string())),
    refundRate: v.string(),
    depositOrg: v.string(),
    convertService: v.union(v.string(), v.array(v.string())),
    membershipService: v.union(v.string(), v.array(v.string())),
    maturityRound: v.number(),
    paymentSections: v.array(v.object({
      start: v.number(),
      end: v.number(),
      funeralAmount: v.number(),
      applianceAmount: v.number(),
    })),
    notices: v.array(v.string()),
    cards: v.array(v.object({
      name: v.string(),
      image: v.string(),
      annualFee: v.number(),
      benefits: v.array(v.string()),
      phoneApply: v.string(),
      onlineApplyUrl: v.string(),
    })),
  }).index("by_custom_id", ["id"]).index("by_brandId", ["brandId"]),

  products: defineTable({
    id: v.string(), // custom id (e.g. 'prod1')
    name: v.string(),
    categoryId: v.string(),
    modelName: v.string(),
    description: v.string(),
    thumbnail: v.string(),
    planId: v.string(), // references plans.id
    accounts: v.optional(v.number()),
    monthly: v.number(),
    cardBenefitPrice: v.number(),
  }).index("by_custom_id", ["id"]).index("by_categoryId", ["categoryId"]),

  sellers: defineTable({
    id: v.string(), // custom id (e.g. 's_1')
    name: v.string(),
    phone: v.string(),
    address: v.string(),
    username: v.string(),
    password: v.string(),
    subdomain: v.string(),
    status: v.string(), // "승인", "보류", "거절"
    registerDate: v.string(),
  }).index("by_custom_id", ["id"]).index("by_username", ["username"]).index("by_subdomain", ["subdomain"]),

  consultations: defineTable({
    id: v.string(), // custom id (e.g. 'c_1')
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
    status: v.string(), // "신규 접수", "상담 진행중", "계약 완료", "상담 취소"
  }).index("by_custom_id", ["id"]).index("by_sellerId", ["sellerId"]),

  settlements: defineTable({
    id: v.string(), // custom id (e.g. 'set_1')
    orderId: v.string(), // references consultations.id
    sellerId: v.string(), // references sellers.id
    customerName: v.string(),
    productName: v.string(),
    brandId: v.string(), // references brands.id
    brandName: v.string(),
    commission: v.number(),
    status: v.string(), // "지급대기", "지급완료", "취소/반송"
    date: v.string(),
  }).index("by_custom_id", ["id"]).index("by_sellerId", ["sellerId"]),
});
