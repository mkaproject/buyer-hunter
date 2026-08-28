import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    company_name: v.string(),
    country: v.optional(v.string()),
    website: v.optional(v.string()),
    product: v.optional(v.string()),
    score: v.number(),
    priority: v.string(),
    status: v.string(),
    notes: v.optional(v.string()),
    products: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("buyers", {
      company_name: args.company_name,
      country: args.country,
      website: args.website,
      product: args.product,
      score: args.score,
      priority: args.priority,
      status: args.status,
      notes: args.notes,
      created_at: now,
      updated_at: now,
    });

    if (args.products) {
      for (const p of args.products) {
        if (p.trim()) {
          await ctx.db.insert("buyer_products", {
            buyer_id: id,
            product_name: p.trim(),
          });
        }
      }
    }

    return { id };
  },
});

export const update = mutation({
  args: {
    id: v.id("buyers"),
    company_name: v.string(),
    country: v.optional(v.string()),
    website: v.optional(v.string()),
    product: v.optional(v.string()),
    score: v.number(),
    priority: v.string(),
    status: v.string(),
    notes: v.optional(v.string()),
    products: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.id, {
      company_name: args.company_name,
      country: args.country,
      website: args.website,
      product: args.product,
      score: args.score,
      priority: args.priority,
      status: args.status,
      notes: args.notes,
      updated_at: now,
    });

    const existing = await ctx.db
      .query("buyer_products")
      .withIndex("by_buyer", (q) => q.eq("buyer_id", args.id))
      .collect();
    for (const e of existing) {
      await ctx.db.delete(e._id);
    }

    if (args.products) {
      for (const p of args.products) {
        if (p.trim()) {
          await ctx.db.insert("buyer_products", {
            buyer_id: args.id,
            product_name: p.trim(),
          });
        }
      }
    }

    return { id: args.id };
  },
});

export const addContact = mutation({
  args: {
    buyer_id: v.id("buyers"),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { buyer_id, ...data } = args;
    return await ctx.db.insert("contacts", { buyer_id, ...data });
  },
});

export const addShipment = mutation({
  args: {
    buyer_id: v.id("buyers"),
    shipment_date: v.optional(v.string()),
    origin_country: v.optional(v.string()),
    quantity: v.optional(v.string()),
    port: v.optional(v.string()),
    product: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { buyer_id, ...data } = args;
    return await ctx.db.insert("shipments", { buyer_id, ...data });
  },
});

export const addFollowup = mutation({
  args: {
    buyer_id: v.id("buyers"),
    followup_date: v.optional(v.string()),
    channel: v.optional(v.string()),
    outcome: v.optional(v.string()),
    next_followup: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { buyer_id, ...data } = args;
    return await ctx.db.insert("followups", { buyer_id, ...data });
  },
});

export const addSource = mutation({
  args: {
    buyer_id: v.id("buyers"),
    source_name: v.optional(v.string()),
    source_url: v.optional(v.string()),
    verified_status: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { buyer_id, ...data } = args;
    return await ctx.db.insert("sources", { buyer_id, ...data });
  },
});
