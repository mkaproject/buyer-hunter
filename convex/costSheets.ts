import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const sheets = await ctx.db.query("cost_sheets").order("desc").collect();
    return Promise.all(
      sheets.map(async (s) => {
        const items = await ctx.db
          .query("cost_items")
          .withIndex("by_cost_sheet", (q) => q.eq("cost_sheet_id", s._id))
          .collect();
        const total_idr = items.reduce(
          (sum, i) => sum + i.quantity * i.unit_cost * i.exchange_rate,
          0
        );
        return {
          id: s._id,
          ...s,
          total_idr,
          item_count: items.length,
        };
      })
    );
  },
});

export const get = query({
  args: { id: v.id("cost_sheets") },
  handler: async (ctx, args) => {
    const sheet = await ctx.db.get(args.id);
    if (!sheet) return null;

    const items = await ctx.db
      .query("cost_items")
      .withIndex("by_cost_sheet", (q) => q.eq("cost_sheet_id", args.id))
      .collect();

    const itemsWithTotal = items.map((i) => ({
      ...i,
      total_idr: i.quantity * i.unit_cost * i.exchange_rate,
    }));

    const total_idr = itemsWithTotal.reduce((sum, i) => sum + i.total_idr, 0);
    const hpp_per_unit =
      sheet.output_qty > 0 ? total_idr / sheet.output_qty : 0;

    const groupMap = new Map<string, number>();
    for (const i of itemsWithTotal) {
      groupMap.set(i.cost_group, (groupMap.get(i.cost_group) || 0) + i.total_idr);
    }
    const groups = Array.from(groupMap.entries())
      .map(([cost_group, total_idr]) => ({ cost_group, total_idr }))
      .sort((a, b) => b.total_idr - a.total_idr);

    return {
      ...sheet,
      items: itemsWithTotal,
      total_idr,
      hpp_per_unit,
      groups,
    };
  },
});

export const create = mutation({
  args: {
    product_name: v.string(),
    output_qty: v.number(),
    output_unit: v.string(),
    target_market: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("cost_sheets", {
      product_name: args.product_name,
      output_qty: args.output_qty,
      output_unit: args.output_unit,
      target_market: args.target_market,
      notes: args.notes,
      created_at: now,
      updated_at: now,
    });
  },
});

export const addItem = mutation({
  args: {
    cost_sheet_id: v.id("cost_sheets"),
    cost_group: v.string(),
    item_name: v.string(),
    quantity: v.number(),
    unit: v.optional(v.string()),
    unit_cost: v.number(),
    currency: v.string(),
    exchange_rate: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const { cost_sheet_id, ...data } = args;
    await ctx.db.insert("cost_items", {
      cost_sheet_id,
      ...data,
      created_at: now,
    });
    await ctx.db.patch(cost_sheet_id, { updated_at: now });
    return { success: true };
  },
});

export const deleteItem = mutation({
  args: { id: v.id("cost_items") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) return null;
    await ctx.db.delete(args.id);
    await ctx.db.patch(item.cost_sheet_id, { updated_at: Date.now() });
    return { success: true };
  },
});

export const deleteSheet = mutation({
  args: { id: v.id("cost_sheets") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("cost_items")
      .withIndex("by_cost_sheet", (q) => q.eq("cost_sheet_id", args.id))
      .collect();
    for (const item of items) {
      await ctx.db.delete(item._id);
    }
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
