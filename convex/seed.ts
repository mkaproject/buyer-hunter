import { mutation } from "./_generated/server";

const SEED = [
  { company_name: "BAIT ALMOUASIL TRADE EST", country: "Saudi Arabia", product: "Coconut charcoal briquette", score: 95, priority: "A", status: "New", notes: "107 shipment; importer from Indonesia" },
  { company_name: "SHOMOUKH AL RAYED EST", country: "Saudi Arabia", product: "Coconut charcoal briquette", score: 92, priority: "A", status: "New", notes: "92 shipment" },
  { company_name: "ANDALUS AL SHARQ GENERAL TRADING LLC", country: "Saudi Arabia", product: "Coconut charcoal briquette", score: 94, priority: "A", status: "New", notes: "112 shipment" },
  { company_name: "SARYAN FUTURE TRADING CO", country: "Saudi Arabia", product: "Coconut charcoal briquette", score: 89, priority: "A", status: "New", notes: "38 shipment" },
  { company_name: "ABDULAZIZ MOHAMMED AWAD BAAZB COMMERCIAL EST", country: "Saudi Arabia", product: "Coconut charcoal briquette", score: 87, priority: "A", status: "New", notes: "39 shipment" },
  { company_name: "THE DISTINGUISHED MOMENT COMMERCIAL EST", country: "Saudi Arabia", product: "Charcoal", score: 74, priority: "B", status: "New", notes: "Charcoal importer" },
  { company_name: "CORNER ALA HAWK TRADING COMPANY", country: "Saudi Arabia", product: "Coconut charcoal", score: 72, priority: "B", status: "New", notes: "Potential importer" },
  { company_name: "FLAVA TOBACCO & SMOKING REQUISITES TRADING LLC", country: "United Arab Emirates", product: "Shisha charcoal", score: 94, priority: "A", status: "New", notes: "24 shipment" },
  { company_name: "TOPLINE COAL & FIREWOOD TRADING LLC", country: "United Arab Emirates", product: "Charcoal & firewood", score: 91, priority: "A", status: "New", notes: "17 shipment" },
  { company_name: "AL ZAEEM AL DAHABI GENERAL TRADING LLC", country: "United Arab Emirates", product: "Coconut charcoal briquette", score: 90, priority: "A", status: "New", notes: "24 briquette shipment" },
  { company_name: "AL QAED INTERNATIONAL GENERAL TRADING", country: "United Arab Emirates", product: "Coconut charcoal briquette", score: 89, priority: "A", status: "New", notes: "22+ shipment" },
  { company_name: "AL MIMAS GENERAL TRADING LLC", country: "United Arab Emirates", product: "Charcoal", score: 88, priority: "A", status: "New", notes: "80 charcoal shipment" },
  { company_name: "ROYAL BBQ GROUP", country: "United Arab Emirates", product: "BBQ charcoal", score: 82, priority: "B", status: "New", notes: "Distributor" },
  { company_name: "JERICO GENERAL TRADING LLC", country: "United Arab Emirates", product: "Coconut briquette", score: 93, priority: "A", status: "New", notes: "High-volume buyer" },
  { company_name: "AL MIMAS GENERAL TRADING", country: "United Arab Emirates", product: "Charcoal", score: 82, priority: "B", status: "New", notes: "Active charcoal importer" },
  { company_name: "LADYBUG USA TRADE LLC", country: "United States", product: "Coconut charcoal briquette", score: 96, priority: "A", status: "New", notes: "31 shipment" },
  { company_name: "AMY GROUP USA INC", country: "United States", product: "Coconut charcoal briquette", score: 94, priority: "A", status: "New", notes: "30 shipment" },
  { company_name: "EXODOS TRADING LLC", country: "United States", product: "Coconut charcoal briquette", score: 87, priority: "A", status: "New", notes: "16 shipment" },
  { company_name: "JEALOUS DEVIL LLC", country: "United States", product: "BBQ charcoal", score: 83, priority: "B", status: "New", notes: "Charcoal importer" },
  { company_name: "GLOBAL ENTERPRISE USA LLC", country: "United States", product: "Coconut briquette", score: 80, priority: "B", status: "New", notes: "Buyer" },
  { company_name: "SUSSHI INTERNATIONAL INC", country: "United States", product: "Charcoal", score: 79, priority: "B", status: "New", notes: "Large charcoal buyer" },
  { company_name: "ARAMCO IMPORT INC", country: "United States", product: "Charcoal", score: 78, priority: "B", status: "New", notes: "Large charcoal buyer" },
  { company_name: "ASHTEL STUDIOS INC", country: "United States", product: "Coconut charcoal", score: 77, priority: "B", status: "New", notes: "Buyer" },
  { company_name: "KDI PREMIUM LOGISTICS GMBH", country: "Germany", product: "Coconut charcoal briquette", score: 88, priority: "A", status: "New", notes: "36 shipment" },
  { company_name: "ITCHA GMBH", country: "Germany", product: "Coconut charcoal briquette", score: 86, priority: "A", status: "New", notes: "25 shipment" },
  { company_name: "KEYF 1001 GMBH", country: "Germany", product: "Coconut charcoal briquette", score: 85, priority: "A", status: "New", notes: "25 shipment" },
  { company_name: "M-POL S.C.", country: "Poland", product: "Charcoal", score: 68, priority: "B", status: "New", notes: "5 shipment" },
  { company_name: "FORMAG GROUP LTD.", country: "Poland", product: "Charcoal", score: 65, priority: "B", status: "New", notes: "3 shipment" },
  { company_name: "LUKRO SP. Z O.O.", country: "Poland", product: "Charcoal", score: 62, priority: "C", status: "New", notes: "2 shipment" },
  { company_name: "FRITZ SCHUR CONSUMER PRODUCTS A/S", country: "Denmark", product: "BBQ briquette", score: 76, priority: "B", status: "New", notes: "BBQ distributor" },
];

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("buyers").first();
    if (existing) return { message: "Already seeded" };

    const now = Date.now();
    const buyerIds: Array<{ id: any; data: (typeof SEED)[number] }> = [];

    for (const s of SEED) {
      const id = await ctx.db.insert("buyers", {
        ...s,
        created_at: now,
        updated_at: now,
      });
      buyerIds.push({ id, data: s });

      const text = (s.product || "").toLowerCase();
      if (text.includes("briquette") || text.includes("charcoal")) {
        await ctx.db.insert("buyer_products", {
          buyer_id: id,
          product_name: "Bricket",
        });
      }
    }

    // Seed contacts
    const contactData = [
      { buyerIdx: 7, name: "Johnny", role: "Sales", email: "johnny@flavatrading.com", phone: "+971 4 878 6976", whatsapp: "+971 50 402 8989", notes: "Public contact" },
      { buyerIdx: 8, email: "sales@toplinecoaltrading.com", phone: "+971 50 968 5926", notes: "Public contact" },
      { buyerIdx: 15, phone: "+1 201-486-0159", notes: "Public contact" },
      { buyerIdx: 29, email: "sve@fscp.eu", phone: "+45 33 96 00 60", notes: "Public contact" },
    ];
    for (const c of contactData) {
      await ctx.db.insert("contacts", {
        buyer_id: buyerIds[c.buyerIdx].id,
        name: c.name,
        role: c.role,
        email: c.email,
        phone: c.phone,
        whatsapp: c.whatsapp,
        notes: c.notes,
      });
    }

    // Seed cost sheets
    const nowMs = Date.now();
    const hppSheet = await ctx.db.insert("cost_sheets", {
      product_name: "Bricket — HPP Produksi Indonesia (baseline)",
      output_qty: 1000,
      output_unit: "kg",
      target_market: "Indonesia",
      notes: "Baseline planning Rp22.000/kg. Ganti dengan biaya pabrik aktual saat tersedia.",
      created_at: nowMs,
      updated_at: nowMs,
    });

    const uaeSheet = await ctx.db.insert("cost_sheets", {
      product_name: "Bricket — Estimasi CFR Jebel Ali, UAE",
      output_qty: 18000,
      output_unit: "kg",
      target_market: "UAE / Jebel Ali",
      notes: "Estimasi 1×20ft. Freight adalah indikatif dan belum termasuk pajak/bea import tujuan.",
      created_at: nowMs,
      updated_at: nowMs,
    });

    const usaSheet = await ctx.db.insert("cost_sheets", {
      product_name: "Bricket — Estimasi CFR New York/Newark, USA",
      output_qty: 26000,
      output_unit: "kg",
      target_market: "USA / New York-Newark",
      notes: "Estimasi 1×40ft HC. Freight adalah indikatif dan belum termasuk pajak/bea import tujuan.",
      created_at: nowMs,
      updated_at: nowMs,
    });

    // HPP items
    const hppItems = [
      { cost_group: "Biaya Modal / Bahan Baku", item_name: "Arang tempurung kelapa", quantity: 1000, unit: "kg", unit_cost: 13000, currency: "IDR", exchange_rate: 1, notes: "Baseline bahan baku" },
      { cost_group: "Biaya Modal / Bahan Baku", item_name: "Tapioka / binder", quantity: 1000, unit: "kg", unit_cost: 700, currency: "IDR", exchange_rate: 1, notes: "Estimasi per kg output" },
      { cost_group: "Tenaga Kerja", item_name: "Produksi & packing", quantity: 1000, unit: "kg", unit_cost: 2000, currency: "IDR", exchange_rate: 1, notes: "Estimasi per kg output" },
      { cost_group: "Overhead Produksi", item_name: "Listrik, gas, air & perawatan", quantity: 1000, unit: "kg", unit_cost: 800, currency: "IDR", exchange_rate: 1, notes: "Estimasi per kg output" },
      { cost_group: "Quality", item_name: "QC, susut & reject", quantity: 1000, unit: "kg", unit_cost: 600, currency: "IDR", exchange_rate: 1, notes: "Estimasi per kg output" },
      { cost_group: "Kemasan", item_name: "Inner pack, inner box & master carton", quantity: 1000, unit: "kg", unit_cost: 2200, currency: "IDR", exchange_rate: 1, notes: "Estimasi per kg output" },
      { cost_group: "Overhead Produksi", item_name: "Admin, sewa & depresiasi", quantity: 1000, unit: "kg", unit_cost: 2700, currency: "IDR", exchange_rate: 1, notes: "Estimasi per kg output" },
    ];
    for (const item of hppItems) {
      await ctx.db.insert("cost_items", { cost_sheet_id: hppSheet, ...item, created_at: nowMs });
    }

    // UAE items
    const uaeItems = [
      { cost_group: "Biaya Modal / Bahan Baku", item_name: "HPP produksi Bricket", quantity: 18000, unit: "kg", unit_cost: 22000, currency: "IDR", exchange_rate: 1, notes: "Tarik dari template HPP produksi" },
      { cost_group: "Biaya Ekspor", item_name: "Trucking pabrik ke pelabuhan", quantity: 1, unit: "container", unit_cost: 5000000, currency: "IDR", exchange_rate: 1, notes: "Estimasi; ganti quotation vendor" },
      { cost_group: "Biaya Ekspor", item_name: "Stuffing, handling & DG", quantity: 1, unit: "container", unit_cost: 8000000, currency: "IDR", exchange_rate: 1, notes: "Estimasi; ganti quotation vendor" },
      { cost_group: "Biaya Ekspor", item_name: "Dokumen & compliance ekspor", quantity: 1, unit: "shipment", unit_cost: 7000000, currency: "IDR", exchange_rate: 1, notes: "Estimasi; ganti quotation vendor" },
      { cost_group: "Freight / Logistik", item_name: "Ocean freight Surabaya–Jebel Ali", quantity: 1, unit: "container", unit_cost: 8048, currency: "USD", exchange_rate: 16250, notes: "Rate indikatif" },
      { cost_group: "Freight / Logistik", item_name: "Asuransi kargo", quantity: 1, unit: "shipment", unit_cost: 1500000, currency: "IDR", exchange_rate: 1, notes: "Estimasi" },
      { cost_group: "Pajak / Bea", item_name: "Pajak atau bea import tujuan", quantity: 1, unit: "shipment", unit_cost: 0, currency: "IDR", exchange_rate: 1, notes: "Input setelah HS code, Incoterm dan importer dikonfirmasi" },
    ];
    for (const item of uaeItems) {
      await ctx.db.insert("cost_items", { cost_sheet_id: uaeSheet, ...item, created_at: nowMs });
    }

    // USA items
    const usaItems = [
      { cost_group: "Biaya Modal / Bahan Baku", item_name: "HPP produksi Bricket", quantity: 26000, unit: "kg", unit_cost: 22000, currency: "IDR", exchange_rate: 1, notes: "Tarik dari template HPP produksi" },
      { cost_group: "Biaya Ekspor", item_name: "Trucking pabrik ke pelabuhan", quantity: 1, unit: "container", unit_cost: 8000000, currency: "IDR", exchange_rate: 1, notes: "Estimasi; ganti quotation vendor" },
      { cost_group: "Biaya Ekspor", item_name: "Stuffing, handling & DG", quantity: 1, unit: "container", unit_cost: 12000000, currency: "IDR", exchange_rate: 1, notes: "Estimasi; ganti quotation vendor" },
      { cost_group: "Biaya Ekspor", item_name: "Dokumen & compliance ekspor", quantity: 1, unit: "shipment", unit_cost: 10000000, currency: "IDR", exchange_rate: 1, notes: "Estimasi; ganti quotation vendor" },
      { cost_group: "Freight / Logistik", item_name: "Ocean freight Surabaya–New York/Newark", quantity: 1, unit: "container", unit_cost: 12824, currency: "USD", exchange_rate: 16250, notes: "Rate indikatif" },
      { cost_group: "Freight / Logistik", item_name: "Asuransi kargo", quantity: 1, unit: "shipment", unit_cost: 4000000, currency: "IDR", exchange_rate: 1, notes: "Estimasi" },
      { cost_group: "Pajak / Bea", item_name: "Pajak atau bea import tujuan", quantity: 1, unit: "shipment", unit_cost: 0, currency: "IDR", exchange_rate: 1, notes: "Input setelah HS code, Incoterm dan importer dikonfirmasi" },
    ];
    for (const item of usaItems) {
      await ctx.db.insert("cost_items", { cost_sheet_id: usaSheet, ...item, created_at: nowMs });
    }

    return { message: "Seeded 30 buyers, 4 contacts, 3 cost sheets with items" };
  },
});
