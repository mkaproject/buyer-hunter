import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export default function CostSheets() {
  const [activeSheet, setActiveSheet] = useState<Id<"cost_sheets"> | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sheets = useQuery(api.costSheets.list);
  const detail = useQuery(
    api.costSheets.get,
    activeSheet ? { id: activeSheet } : "skip"
  );

  const createSheet = useMutation(api.costSheets.create);
  const addItem = useMutation(api.costSheets.addItem);
  const deleteSheet = useMutation(api.costSheets.deleteSheet);

  const money = (n: number) =>
    "Rp " + Number(n || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

  const handleCreateSheet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const id = await createSheet({
      product_name: fd.get("product_name") as string,
      output_qty: Number(fd.get("output_qty")),
      output_unit: fd.get("output_unit") as string,
      target_market: fd.get("target_market") as string,
      notes: fd.get("notes") as string,
    });
    setActiveSheet(id);
  };

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeSheet) return;
    const fd = new FormData(e.currentTarget);
    await addItem({
      cost_sheet_id: activeSheet,
      cost_group: fd.get("cost_group") as string,
      item_name: fd.get("item_name") as string,
      quantity: Number(fd.get("quantity") || 1),
      unit: fd.get("unit") as string,
      unit_cost: Number(fd.get("unit_cost") || 0),
      currency: fd.get("currency") as string || "IDR",
      exchange_rate: Number(fd.get("exchange_rate") || 1),
      notes: fd.get("notes") as string,
    });
  };

  const handleDeleteSheet = async (id: Id<"cost_sheets">) => {
    if (confirm("Hapus cost sheet ini?")) {
      await deleteSheet({ id });
      if (activeSheet === id) setActiveSheet(null);
    }
  };

  return (
    <>
      <header className="top">
        <div>
          <div className="brand">
            Biaya <span>&amp; HPP</span>
          </div>
          <div className="sub">Perhitungan lokal untuk produk ekspor</div>
        </div>
        <div className="top-actions">
          <Link to="/" className="nav-link">← Buyer Hunting</Link>
          <button className="hamburger" onClick={() => setMobileOpen(true)}>☰</button>
        </div>
      </header>

      <div className={`mobile-overlay ${mobileOpen ? "open" : ""}`} onClick={() => setMobileOpen(false)} />
      <nav className={`mobile-menu ${mobileOpen ? "open" : ""}`}>
        <button className="close-mobile" onClick={() => setMobileOpen(false)}>×</button>
        <div className="brand">Biaya <span style={{ color: "#ff9162" }}>&amp; HPP</span></div>
        <div className="sub">Perhitungan lokal untuk produk ekspor</div>
        <Link to="/" onClick={() => setMobileOpen(false)}>← Buyer Hunting</Link>
      </nav>

      <main className="wrap">
        {sheets && (
          <section className="cards">
            <div className="card">
              <span className="muted">Total cost sheet</span>
              <b>{sheets.length}</b>
              <span className="muted">produk / batch</span>
            </div>
            <div className="card">
              <span className="muted">Total biaya tercatat</span>
              <b>{money(sheets.reduce((a: number, x: any) => a + Number(x.total_idr), 0))}</b>
              <span className="muted">dalam rupiah</span>
            </div>
            <div className="card">
              <span className="muted">Cara pakai</span>
              <b style={{ fontSize: "17px" }}>Buat sheet → tambah biaya</b>
              <span className="muted">HPP dihitung otomatis per unit</span>
            </div>
          </section>
        )}

        <section className="box">
          <h2 style={{ marginTop: 0 }}>Buat perhitungan produk / batch</h2>
          <form onSubmit={handleCreateSheet} className="form-grid">
            <div className="field">
              <label>Produk *</label>
              <select name="product_name" required>
                <option>Bricket</option>
                <option>Cocopeat</option>
                <option>Cocofiber</option>
                <option>VCO</option>
              </select>
            </div>
            <div className="field">
              <label>Output produksi / pengiriman *</label>
              <input name="output_qty" type="number" min="0.01" step="any" placeholder="Contoh: 20000" required />
            </div>
            <div className="field">
              <label>Satuan output</label>
              <select name="output_unit">
                <option>kg</option>
                <option>ton</option>
                <option>liter</option>
                <option>pcs</option>
                <option>container</option>
              </select>
            </div>
            <div className="field">
              <label>Target pasar</label>
              <input name="target_market" placeholder="Contoh: UAE / Jebel Ali" />
            </div>
            <div className="field full">
              <label>Catatan</label>
              <textarea name="notes" placeholder="Contoh: harga FOB, shipment Oktober" />
            </div>
            <div className="actions full">
              <button type="submit" className="primary">+ Buat Cost Sheet</button>
            </div>
          </form>
        </section>

        <section className="box">
          <h2 style={{ marginTop: 0 }}>Cost sheet</h2>
          <div className="list">
            {sheets?.map((s: any) => (
              <div
                key={s.id}
                className={`sheet ${activeSheet === s.id ? "active" : ""}`}
                onClick={() => setActiveSheet(s.id)}
              >
                <b>{s.product_name} · {s.output_qty} {s.output_unit}</b>
                <span className="muted">
                  {s.target_market || "Tanpa target pasar"} · {s.item_count} komponen · {money(s.total_idr)}
                </span>
              </div>
            ))}
            {(!sheets || sheets.length === 0) && (
              <div className="muted">Belum ada perhitungan. Buat cost sheet pertama di atas.</div>
            )}
          </div>
        </section>

        {detail && (
          <section className="box detail">
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
              <div>
                <h2 style={{ margin: 0 }}>{detail.product_name}</h2>
                <div className="muted">{detail.output_qty} {detail.output_unit} · {detail.target_market || "Tanpa target pasar"}</div>
              </div>
              <div>
                <b style={{ fontSize: "19px" }}>{money(detail.hpp_per_unit)}</b>
                <div className="muted">HPP / {detail.output_unit}</div>
              </div>
            </div>

            <div className="cost-summary">
              <div><b>{detail.items?.length || 0}</b> komponen</div>
              <div><b>{money(detail.total_idr)}</b> total</div>
              <div style={{ marginLeft: "auto" }}>
                <button className="btn-danger" onClick={() => handleDeleteSheet(detail._id)}>
                  Hapus Sheet
                </button>
              </div>
            </div>

            <div className="groups">
              {detail.groups?.map((g: any, i: number) => (
                <div key={i} className="group-item">
                  <span className="group-label">{g.cost_group}</span>
                  <b>{money(g.total_idr)}</b>
                </div>
              ))}
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>Kelompok</th>
                  <th>Komponen</th>
                  <th>Kalkulasi</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {detail.items?.map((item: any) => (
                  <tr key={item._id}>
                    <td><span className="group">{item.cost_group}</span></td>
                    <td>{item.item_name}{item.notes ? <br /> : null}<span className="muted">{item.notes}</span></td>
                    <td>{item.quantity} {item.unit || ""} × {item.currency} {Number(item.unit_cost).toLocaleString()}</td>
                    <td><b>{money(item.total_idr)}</b></td>
                  </tr>
                ))}
                {(!detail.items || detail.items.length === 0) && (
                  <tr><td colSpan={4} className="muted">Belum ada komponen biaya.</td></tr>
                )}
              </tbody>
            </table>

            <h3 style={{ marginTop: "20px" }}>Tambah Komponen Biaya</h3>
            <form onSubmit={handleAddItem} className="form-grid">
              <div className="field">
                <label>Kelompok biaya *</label>
                <select name="cost_group" required>
                  <option>Biaya Modal / HPP</option>
                  <option>Biaya Modal / Bahan Baku</option>
                  <option>Biaya Ekspor</option>
                  <option>Freight / Logistik</option>
                  <option>Pajak / Bea</option>
                  <option>Tenaga Kerja</option>
                  <option>Overhead Produksi</option>
                  <option>Quality</option>
                  <option>Kemasan</option>
                </select>
              </div>
              <div className="field">
                <label>Nama komponen *</label>
                <input name="item_name" required placeholder="Contoh: Ocean freight" />
              </div>
              <div className="field">
                <label>Jumlah</label>
                <input name="quantity" type="number" defaultValue="1" min="0" step="any" />
              </div>
              <div className="field">
                <label>Satuan</label>
                <input name="unit" placeholder="kg, container, shipment" />
              </div>
              <div className="field">
                <label>Harga satuan *</label>
                <input name="unit_cost" type="number" defaultValue="0" min="0" step="any" required />
              </div>
              <div className="field">
                <label>Mata uang</label>
                <select name="currency">
                  <option>IDR</option>
                  <option>USD</option>
                  <option>EUR</option>
                </select>
              </div>
              <div className="field">
                <label>Kurs</label>
                <input name="exchange_rate" type="number" defaultValue="1" min="0" step="any" />
              </div>
              <div className="field">
                <label>Catatan</label>
                <input name="notes" placeholder="Opsional" />
              </div>
              <div className="actions full">
                <button type="submit" className="primary">+ Tambah Komponen</button>
              </div>
            </form>
          </section>
        )}
      </main>
    </>
  );
}
