import { query } from "./_generated/server";
import { v } from "convex/values";

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const buyers = await ctx.db.query("buyers").collect();
    const total = buyers.length;
    const priority_a = buyers.filter((b) => b.priority === "A").length;
    const uncontacted = buyers.filter((b) => b.status === "New").length;
    const replied = buyers.filter((b) => b.status === "Replied").length;

    const countryMap = new Map<string, number>();
    for (const b of buyers) {
      if (b.country) {
        countryMap.set(b.country, (countryMap.get(b.country) || 0) + 1);
      }
    }
    const countries = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);

    return { total, priority_a, uncontacted, replied, countries };
  },
});

export const list = query({
  args: {
    search: v.optional(v.string()),
    country: v.optional(v.string()),
    priority: v.optional(v.string()),
    status: v.optional(v.string()),
    product: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let buyers = await ctx.db.query("buyers").collect();

    if (args.search) {
      const q = args.search.toLowerCase();
      buyers = buyers.filter(
        (b) =>
          b.company_name.toLowerCase().includes(q) ||
          (b.country && b.country.toLowerCase().includes(q)) ||
          (b.product && b.product.toLowerCase().includes(q))
      );
    }
    if (args.country) {
      buyers = buyers.filter((b) => b.country === args.country);
    }
    if (args.priority) {
      buyers = buyers.filter((b) => b.priority === args.priority);
    }
    if (args.status) {
      buyers = buyers.filter((b) => b.status === args.status);
    }
    if (args.product) {
      const productBuyers = await ctx.db
        .query("buyer_products")
        .withIndex("by_product_name", (q) => q.eq("product_name", args.product!))
        .collect();
      const ids = new Set(productBuyers.map((p) => p.buyer_id));
      buyers = buyers.filter((b) => ids.has(b._id));
    }

    const priorityOrder: Record<string, number> = { A: 1, B: 2, C: 3 };
    buyers.sort((a, b) => {
      const pa = priorityOrder[a.priority] || 3;
      const pb = priorityOrder[b.priority] || 3;
      if (pa !== pb) return pa - pb;
      if (b.score !== a.score) return b.score - a.score;
      return a.company_name.localeCompare(b.company_name);
    });

    const result = await Promise.all(
      buyers.map(async (b) => {
        const products = await ctx.db
          .query("buyer_products")
          .withIndex("by_buyer", (q) => q.eq("buyer_id", b._id))
          .collect();
        const contact_count = await ctx.db
          .query("contacts")
          .withIndex("by_buyer", (q) => q.eq("buyer_id", b._id))
          .collect();
        const followup_count = await ctx.db
          .query("followups")
          .withIndex("by_buyer", (q) => q.eq("buyer_id", b._id))
          .collect();
        return {
          id: b._id,
          ...b,
          product_tags: products.map((p) => p.product_name).join(", "),
          contact_count: contact_count.length,
          followup_count: followup_count.length,
        };
      })
    );

    return result;
  },
});

export const get = query({
  args: { id: v.id("buyers") },
  handler: async (ctx, args) => {
    const buyer = await ctx.db.get(args.id);
    if (!buyer) return null;

    const products = await ctx.db
      .query("buyer_products")
      .withIndex("by_buyer", (q) => q.eq("buyer_id", args.id))
      .collect();
    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_buyer", (q) => q.eq("buyer_id", args.id))
      .collect();
    const shipments = await ctx.db
      .query("shipments")
      .withIndex("by_buyer", (q) => q.eq("buyer_id", args.id))
      .collect();
    const followups = await ctx.db
      .query("followups")
      .withIndex("by_buyer", (q) => q.eq("buyer_id", args.id))
      .collect();
    const sources = await ctx.db
      .query("sources")
      .withIndex("by_buyer", (q) => q.eq("buyer_id", args.id))
      .collect();

    return {
      ...buyer,
      products: products.map((p) => p.product_name),
      contacts,
      shipments,
      followups,
      sources,
    };
  },
});
