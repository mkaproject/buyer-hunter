import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useAuthActions } from "@convex-dev/auth/react";

export default function BuyerHunting() {
  const { signOut } = useAuthActions();
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [product, setProduct] = useState("");
  const [panelBuyerId, setPanelBuyerId] = useState<Id<"buyers"> | null>(null);
  const [editingBuyer, setEditingBuyer] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("contacts");
  const [mobileOpen, setMobileOpen] = useState(false);

  const stats = useQuery(api.buyers.getStats);
  const buyers = useQuery(api.buyers.list, {
    search: search || undefined,
    country: country || undefined,
    priority: priority || undefined,
    status: status || undefined,
    product: product || undefined,
  });

  const buyerDetail = useQuery(
    api.buyers.get,
    panelBuyerId ? { id: panelBuyerId } : "skip"
  );

  const createBuyer = useMutation(api.buyerMutations.create);
  const updateBuyer = useMutation(api.buyerMutations.update);
  const addContact = useMutation(api.buyerMutations.addContact);
  const addShipment = useMutation(api.buyerMutations.addShipment);
  const addFollowup = useMutation(api.buyerMutations.addFollowup);
  const addSource = useMutation(api.buyerMutations.addSource);

  const badge = (v: string) => {
    const cls = v?.toLowerCase().replace(/\s/g, "") || "new";
    return <span className={`badge ${cls}`}>{v || "—"}</span>;
  };

  const openBuyer = (b: any) => {
    setPanelBuyerId(b._id);
    setShowForm(false);
    setEditingBuyer(null);
    setActiveTab("contacts");
  };

  const openNew = () => {
    setEditingBuyer(null);
    setShowForm(true);
    setPanelBuyerId(null);
  };

  const handleSaveBuyer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      company_name: fd.get("company_name") as string,
      country: fd.get("country") as string,
      website: fd.get("website") as string,
      product: fd.get("product") as string,
      score: Number(fd.get("score") || 0),
      priority: fd.get("priority") as string,
      status: fd.get("status") as string,
      notes: fd.get("notes") as string,
      products: (fd.get("products") as string || "").split(",").map((s: string) => s.trim()).filter(Boolean),
    };

    if (editingBuyer) {
      await updateBuyer({ id: editingBuyer._id, ...data });
    } else {
      await createBuyer(data);
    }
    setShowForm(false);
    setEditingBuyer(null);
  };

  const handleAddRecord = async (type: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!buyerDetail) return;
    const fd = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    fd.forEach((v, k) => { if (v) data[k] = v as string; });

    if (type === "contacts") await addContact({ buyer_id: buyerDetail._id, ...data });
    if (type === "shipments") await addShipment({ buyer_id: buyerDetail._id, ...data });
    if (type === "followups") await addFollowup({ buyer_id: buyerDetail._id, ...data });
    if (type === "sources") await addSource({ buyer_id: buyerDetail._id, ...data });

    setActiveTab(type);
  };

  const renderForm = (initial?: Record<string, string>) => (
    <form onSubmit={handleSaveBuyer} className="form-grid">
      <div className="field full">
        <label>Nama perusahaan *</label>
        <input name="company_name" required defaultValue={initial?.company_name} />
      </div>
      <div className="field">
        <label>Negara</label>
        <input name="country" defaultValue={initial?.country} />
      </div>
      <div className="field">
        <label>Website</label>
        <input name="website" defaultValue={initial?.website} />
      </div>
      <div className="field">
        <label>Produk</label>
        <input name="product" defaultValue={initial?.product} />
      </div>
      <div className="field">
        <label>Score</label>
        <input name="score" type="number" defaultValue={initial?.score || "0"} />
      </div>
      <div className="field">
        <label>Priority</label>
        <select name="priority" defaultValue={initial?.priority || "B"}>
          <option>A</option><option>B</option><option>C</option>
        </select>
      </div>
      <div className="field">
        <label>Status</label>
        <select name="status" defaultValue={initial?.status || "New"}>
          <option>New</option><option>Contacted</option><option>Replied</option>
          <option>Negotiation</option><option>Closed</option>
        </select>
      </div>
      <div className="field">
        <label>Product tags (koma)</label>
        <input name="products" defaultValue={initial?.products} placeholder="Bricket, Cocopeat" />
      </div>
      <div className="field full">
        <label>Catatan</label>
        <textarea name="notes" defaultValue={initial?.notes} />
      </div>
      <div className="actions full">
        <button type="submit" className="primary">Simpan</button>
        <button type="button" onClick={() => { setShowForm(false); setEditingBuyer(null); }}>Batal</button>
      </div>
    </form>
  );

  const renderAddRecord = (type: string) => {
    const fields: Record<string, { label: string; key: string; type?: string }[]> = {
      contacts: [
        { label: "Nama", key: "name" },
        { label: "Jabatan", key: "role" },
        { label: "Email", key: "email", type: "email" },
        { label: "Telepon", key: "phone" },
        { label: "WhatsApp", key: "whatsapp" },
        { label: "LinkedIn", key: "linkedin" },
        { label: "Catatan", key: "notes" },
      ],
      shipments: [
        { label: "Tanggal", key: "shipment_date", type: "date" },
        { label: "Negara asal", key: "origin_country" },
        { label: "Jumlah", key: "quantity" },
        { label: "Pelabuhan", key: "port" },
        { label: "Produk", key: "product" },
        { label: "Catatan", key: "notes" },
      ],
      followups: [
        { label: "Tanggal", key: "followup_date", type: "date" },
        { label: "Channel", key: "channel" },
        { label: "Hasil", key: "outcome" },
        { label: "Follow-up berikutnya", key: "next_followup", type: "date" },
        { label: "Catatan", key: "notes" },
      ],
      sources: [
        { label: "Nama sumber", key: "source_name" },
        { label: "URL sumber", key: "source_url" },
        { label: "Status verifikasi", key: "verified_status" },
        { label: "Catatan", key: "notes" },
      ],
    };

    return (
      <form onSubmit={(e) => handleAddRecord(type, e)} className="form-grid">
        {fields[type]?.map((f) => (
          <div key={f.key} className={`field ${f.key === "notes" ? "full" : ""}`}>
            <label>{f.label}</label>
            <input name={f.key} type={f.type || "text"} />
          </div>
        ))}
        <div className="actions full">
          <button type="submit" className="primary">Simpan</button>
        </div>
      </form>
    );
  };

  const renderRecords = (list: any[], keys: string[]) =>
    list.length ? (
      list.map((r, i) => (
        <div key={i} className="record">
          <b>{r[keys[0]] || "—"}</b>
          {keys.slice(1).map((k) =>
            r[k] ? (
              <span key={k}>
                {k.replace(/_/g, " ")}: {r[k]}
              </span>
            ) : null
          )}
        </div>
      ))
    ) : (
      <div className="muted">Belum ada data.</div>
    );

  return (
    <>
      <header className="top">
        <div>
          <div className="brand">
            Buyer <span>Hunting</span>
          </div>
          <div className="sub">CRM · buyer untuk produk kelapa</div>
        </div>
        <div className="top-actions">
          <Link to="/costs" className="nav-link">Biaya & HPP</Link>
          <button className="primary" onClick={openNew}>+ Tambah Buyer</button>
          <button className="btn-logout" onClick={() => signOut()}>Logout</button>
          <button className="hamburger" onClick={() => setMobileOpen(true)}>☰</button>
        </div>
      </header>

      <div className={`mobile-overlay ${mobileOpen ? "open" : ""}`} onClick={() => setMobileOpen(false)} />
      <nav className={`mobile-menu ${mobileOpen ? "open" : ""}`}>
        <button className="close-mobile" onClick={() => setMobileOpen(false)}>×</button>
        <div className="brand">Buyer <span style={{ color: "#ff9162" }}>Hunting</span></div>
        <div className="sub">CRM · buyer untuk produk kelapa</div>
        <button onClick={() => { openNew(); setMobileOpen(false); }}>+ Tambah Buyer</button>
        <Link to="/costs" onClick={() => setMobileOpen(false)}>Biaya & HPP</Link>
        <button onClick={() => { signOut(); setMobileOpen(false); }}>Logout</button>
      </nav>

      <main className="wrap">
        {stats && (
          <section className="stats">
            <div className="stat"><b>{stats.total}</b><small>Total buyer</small></div>
            <div className="stat"><b>{stats.priority_a}</b><small>Priority A</small></div>
            <div className="stat"><b>{stats.uncontacted}</b><small>Belum dihubungi</small></div>
            <div className="stat"><b>{stats.replied}</b><small>Sudah membalas</small></div>
          </section>
        )}

        <section className="toolbar">
          <input
            placeholder="Cari perusahaan, negara, atau produk…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">Semua negara</option>
            {stats?.countries?.map((c: any) => (
              <option key={c.country} value={c.country}>{c.country} ({c.count})</option>
            ))}
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">Semua priority</option>
            <option>A</option><option>B</option><option>C</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Semua status</option>
            <option>New</option><option>Contacted</option><option>Replied</option>
            <option>Negotiation</option><option>Closed</option>
          </select>
          <select value={product} onChange={(e) => setProduct(e.target.value)}>
            <option value="">Semua produk</option>
            <option>Bricket</option><option>Cocopeat</option><option>Cocofiber</option><option>VCO</option>
          </select>
          <button onClick={() => { setSearch(""); setCountry(""); setPriority(""); setStatus(""); setProduct(""); }}>
            Reset
          </button>
        </section>

        <div className="tablebox">
          <table>
            <thead>
              <tr>
                <th>Buyer</th><th>Country</th><th>Product tags</th>
                <th>Score</th><th>Priority</th><th>Status</th>
                <th>Contact</th><th>Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {buyers?.map((b: any) => (
                <tr key={b._id} onClick={() => openBuyer(b)} style={{ cursor: "pointer" }}>
                  <td><b>{b.company_name}</b>{b.website && <br />}<small className="muted">{b.website}</small></td>
                  <td>{b.country || "—"}</td>
                  <td>{b.product_tags || "—"}</td>
                  <td>{b.score}</td>
                  <td>{badge(b.priority)}</td>
                  <td>{badge(b.status)}</td>
                  <td>{b.contact_count}</td>
                  <td>{b.followup_count}</td>
                </tr>
              ))}
              {(!buyers || buyers.length === 0) && (
                <tr><td colSpan={8} className="empty">Tidak ada buyer sesuai filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {(panelBuyerId || showForm) && (
        <aside className="panel open">
          <div className="panelhead">
            <div>
              <h2>{showForm ? (editingBuyer ? "Edit Buyer" : "Tambah Buyer") : buyerDetail?.company_name}</h2>
              <div className="muted">
                {showForm ? "Lead baru akan tersimpan di Convex" : `#${buyerDetail?._id}`}
              </div>
            </div>
            <button className="close" onClick={() => { setPanelBuyerId(null); setShowForm(false); setEditingBuyer(null); }}>×</button>
          </div>

          {showForm && renderForm(editingBuyer ? {
            company_name: editingBuyer.company_name,
            country: editingBuyer.country || "",
            website: editingBuyer.website || "",
            product: editingBuyer.product || "",
            score: String(editingBuyer.score),
            priority: editingBuyer.priority,
            status: editingBuyer.status,
            notes: editingBuyer.notes || "",
            products: Array.isArray(editingBuyer.products) ? editingBuyer.products.join(", ") : "",
          } : undefined)}

          {!showForm && buyerDetail && (
            <div className="panel-body">
              <div className="tabs">
                <button className={activeTab === "contacts" ? "active" : ""} onClick={() => setActiveTab("contacts")}>Contacts ({buyerDetail.contacts?.length || 0})</button>
                <button className={activeTab === "shipments" ? "active" : ""} onClick={() => setActiveTab("shipments")}>Shipments ({buyerDetail.shipments?.length || 0})</button>
                <button className={activeTab === "followups" ? "active" : ""} onClick={() => setActiveTab("followups")}>Follow-ups ({buyerDetail.followups?.length || 0})</button>
                <button className={activeTab === "sources" ? "active" : ""} onClick={() => setActiveTab("sources")}>Sources ({buyerDetail.sources?.length || 0})</button>
              </div>

              <div className="tab-content">
                {activeTab === "contacts" && (
                  <>
                    {renderRecords(buyerDetail.contacts || [], ["name", "role", "email", "phone", "whatsapp"])}
                    {renderAddRecord("contacts")}
                  </>
                )}
                {activeTab === "shipments" && (
                  <>
                    {renderRecords(buyerDetail.shipments || [], ["shipment_date", "product", "quantity", "origin_country", "port"])}
                    {renderAddRecord("shipments")}
                  </>
                )}
                {activeTab === "followups" && (
                  <>
                    {renderRecords(buyerDetail.followups || [], ["followup_date", "channel", "outcome", "next_followup"])}
                    {renderAddRecord("followups")}
                  </>
                )}
                {activeTab === "sources" && (
                  <>
                    {renderRecords(buyerDetail.sources || [], ["source_name", "source_url", "verified_status"])}
                    {renderAddRecord("sources")}
                  </>
                )}
              </div>
            </div>
          )}
        </aside>
      )}
    </>
  );
}
