import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  buyers: defineTable({
    company_name: v.string(),
    country: v.optional(v.string()),
    website: v.optional(v.string()),
    product: v.optional(v.string()),
    score: v.number(),
    priority: v.string(),
    status: v.string(),
    notes: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_country", ["country"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"]),

  contacts: defineTable({
    buyer_id: v.id("buyers"),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    notes: v.optional(v.string()),
  }).index("by_buyer", ["buyer_id"]),

  shipments: defineTable({
    buyer_id: v.id("buyers"),
    shipment_date: v.optional(v.string()),
    origin_country: v.optional(v.string()),
    quantity: v.optional(v.string()),
    port: v.optional(v.string()),
    product: v.optional(v.string()),
    notes: v.optional(v.string()),
  }).index("by_buyer", ["buyer_id"]),

  followups: defineTable({
    buyer_id: v.id("buyers"),
    followup_date: v.optional(v.string()),
    channel: v.optional(v.string()),
    outcome: v.optional(v.string()),
    next_followup: v.optional(v.string()),
    notes: v.optional(v.string()),
  }).index("by_buyer", ["buyer_id"]),

  sources: defineTable({
    buyer_id: v.id("buyers"),
    source_name: v.optional(v.string()),
    source_url: v.optional(v.string()),
    verified_status: v.optional(v.string()),
    notes: v.optional(v.string()),
  }).index("by_buyer", ["buyer_id"]),

  buyer_products: defineTable({
    buyer_id: v.id("buyers"),
    product_name: v.string(),
  })
    .index("by_buyer", ["buyer_id"])
    .index("by_product_name", ["product_name"]),

  cost_sheets: defineTable({
    product_name: v.string(),
    output_qty: v.number(),
    output_unit: v.string(),
    target_market: v.optional(v.string()),
    notes: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
  }),

  cost_items: defineTable({
    cost_sheet_id: v.id("cost_sheets"),
    cost_group: v.string(),
    item_name: v.string(),
    quantity: v.number(),
    unit: v.optional(v.string()),
    unit_cost: v.number(),
    currency: v.string(),
    exchange_rate: v.number(),
    notes: v.optional(v.string()),
    created_at: v.number(),
  }).index("by_cost_sheet", ["cost_sheet_id"]),
});
