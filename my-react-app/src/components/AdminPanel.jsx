import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL, { apiFetch } from "../config/api";

function Heatmap({ data, title }) {
  const map = {};
  data.forEach(d => { map[d._id] = d.count; });
  const max = Math.max(...Object.values(map), 1);
  const cells = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    cells.push({ key, count: map[key] || 0 });
  }
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const getColor = (count) => {
    if (count === 0) return "#EEF0FB";
    const t = Math.min(count / max, 1);
    if (t < 0.25) return "#c7cef5";
    if (t < 0.5) return "#8f9de8";
    if (t < 0.75) return "#5566d4";
    return "#242D96";
  };
  return (
    <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1.5px solid #e8ecf8", marginBottom: 20 }}>
      <h3 style={{ margin: "0 0 16px", color: "#242D96", fontSize: 15, fontFamily: "Teachers,sans-serif" }}>{title}</h3>
      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 3, minWidth: 700 }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {week.map((cell, di) => (
                <div key={di} title={`${cell.key}: ${cell.count}`}
                  style={{ width: 13, height: 13, borderRadius: 2, background: getColor(cell.count), cursor: "default", transition: "transform 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.4)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} />
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 10, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#BBC8D8", fontFamily: "Teachers,sans-serif" }}>Меньше</span>
          {["#EEF0FB","#c7cef5","#8f9de8","#5566d4","#242D96"].map((c,i) => <div key={i} style={{ width: 13, height: 13, borderRadius: 2, background: c }} />)}
          <span style={{ fontSize: 11, color: "#BBC8D8", fontFamily: "Teachers,sans-serif" }}>Больше</span>
        </div>
      </div>
    </div>
  );
}

function BarChart({ data, color = "#242D96" }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 110, paddingTop: 20 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }} title={`${d.date}: ${d.count}`}>
          <span style={{ fontSize: 8, color: "#788CA5", fontFamily: "Teachers,sans-serif", minHeight: 12 }}>{d.count > 0 ? d.count : ""}</span>
          <div style={{ width: "100%", height: 72, display: "flex", alignItems: "flex-end" }}>
            <div style={{ width: "100%", height: `${Math.max((d.count / max) * 100, d.count > 0 ? 3 : 0)}%`, background: color, borderRadius: "3px 3px 0 0", transition: "height 0.5s ease" }} />
          </div>
          <span style={{ fontSize: 8, color: "#BBC8D8", fontFamily: "Teachers,sans-serif", transform: "rotate(-45deg)", transformOrigin: "top center", whiteSpace: "nowrap", marginTop: 4 }}>{d.date?.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

function PieChart({ segments }) {
  const total = segments.reduce((s, sg) => s + sg.value, 0);
  if (total === 0) return <div style={{ textAlign: "center", color: "#BBC8D8", fontSize: 13, padding: 20 }}>Нет данных</div>;
  let cum = 0;
  const paths = segments.map(sg => {
    const pct = sg.value / total;
    const s = cum * 2 * Math.PI - Math.PI / 2; cum += pct;
    const e = cum * 2 * Math.PI - Math.PI / 2;
    const r = 70, cx = 90, cy = 90;
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
    return { ...sg, d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${pct > 0.5 ? 1 : 0},1 ${x2},${y2} Z`, pct };
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} stroke="white" strokeWidth="2"><title>{p.label}: {p.value}</title></path>)}
        <circle cx="90" cy="90" r="38" fill="white" />
        <text x="90" y="87" textAnchor="middle" style={{ fontSize: 11, fill: "#788CA5", fontFamily: "Teachers,sans-serif" }}>Всего</text>
        <text x="90" y="103" textAnchor="middle" style={{ fontSize: 18, fontWeight: "bold", fill: "#242D96", fontFamily: "Teachers,sans-serif" }}>{total}</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {paths.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: p.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "#242D96", fontWeight: 600, fontFamily: "Teachers,sans-serif" }}>{p.value}</span>
            <span style={{ fontSize: 12, color: "#788CA5", fontFamily: "Teachers,sans-serif" }}>{p.label} ({Math.round(p.pct * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color = "#242D96", bg = "#EEF0FB", icon }) {
  return (
    <div style={{ background: "white", borderRadius: 16, padding: "20px 24px", border: "1.5px solid #e8ecf8", flex: "1 1 130px", minWidth: 120 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{icon}</div>
        <span style={{ fontSize: 12, color: "#788CA5", fontFamily: "Teachers,sans-serif" }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: "Teachers,sans-serif", lineHeight: 1 }}>{(value || 0).toLocaleString()}</div>
      {sub && <div style={{ fontSize: 11, color: "#BBC8D8", marginTop: 4, fontFamily: "Teachers,sans-serif" }}>{sub}</div>}
    </div>
  );
}

function AdminPanel() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [heatmap, setHeatmap] = useState({ registrations: [], aiRequests: [] });
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    apiFetch(`${API_BASE_URL}/api/user/data`).then(r => r.json()).then(d => {
      if (!d.success || d.userData?.role !== "admin") navigate("/"); else setLoading(false);
    }).catch(() => navigate("/login"));
  }, []);

  useEffect(() => {
    if (tab === "dashboard") {
      apiFetch(`${API_BASE_URL}/api/admin/stats`).then(r => r.json()).then(d => { if (d.success) setStats(d.stats); });
      apiFetch(`${API_BASE_URL}/api/admin/heatmap`).then(r => r.json()).then(d => { if (d.success) setHeatmap(d); });
    }
  }, [tab]);

  const loadUsers = useCallback(() => {
    setUsersLoading(true);
    apiFetch(`${API_BASE_URL}/api/admin/users?search=${encodeURIComponent(search)}&page=${page}&limit=20&filter=${filter}`)
      .then(r => r.json()).then(d => { if (d.success) { setUsers(d.users); setTotal(d.total); setPages(d.pages); } setUsersLoading(false); })
      .catch(() => setUsersLoading(false));
  }, [search, page, filter]);

  useEffect(() => { if (tab === "users") loadUsers(); }, [tab, loadUsers]);

  const togglePremium = async (userId, current) => {
    setActionLoading(userId + "_p");
    const res = await apiFetch(`${API_BASE_URL}/api/admin/users/${userId}/premium`, { method: "PATCH", body: JSON.stringify({ premium: !current }) });
    const d = await res.json();
    if (d.success) { setUsers(prev => prev.map(u => u._id === userId ? { ...u, premium: !current } : u)); showToast(!current ? "💎 Premium выдан" : "Premium снят"); }
    setActionLoading(null);
  };

  const resetLimits = async (userId) => {
    setActionLoading(userId + "_r");
    const res = await apiFetch(`${API_BASE_URL}/api/admin/users/${userId}/reset-limits`, { method: "PATCH" });
    const d = await res.json();
    if (d.success) { setUsers(prev => prev.map(u => u._id === userId ? { ...u, aiPhotoUsed: 0, aiPlanUsed: 0 } : u)); showToast("↺ Лимиты сброшены"); }
    setActionLoading(null);
  };

  const deleteUser = async (userId) => {
    setActionLoading(userId + "_d");
    const res = await apiFetch(`${API_BASE_URL}/api/admin/users/${userId}`, { method: "DELETE" });
    const d = await res.json();
    if (d.success) { setUsers(prev => prev.filter(u => u._id !== userId)); setTotal(p => p - 1); showToast("Удалён"); }
    setActionLoading(null); setDeleteConfirm(null);
  };

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9ff" }}><div className="loader" /></div>;

  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().slice(0, 10);
    const found = stats?.registrationsByDay?.find(r => r.date === key);
    return { date: key, count: found?.count || 0 };
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9ff", fontFamily: "Teachers, sans-serif" }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {toast && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: toast.type === "error" ? "#FF786D" : "#029663", color: "white", borderRadius: 12, padding: "12px 20px", fontSize: 14, fontFamily: "Teachers,sans-serif", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", animation: "fadeIn 0.2s ease" }}>{toast.msg}</div>}

      <div style={{ background: "#242D96", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👨‍🍳</div>
          <span style={{ color: "white", fontSize: 16, fontWeight: 600, fontFamily: "Taviraj,serif" }}>YouChef Admin</span>
        </div>
        <button onClick={() => navigate("/")} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 20, padding: "6px 14px", color: "white", fontSize: 13, cursor: "pointer" }}>← На сайт</button>
      </div>

      <div style={{ background: "white", borderBottom: "1.5px solid #e8ecf8", padding: "0 24px", display: "flex" }}>
        {[{ key: "dashboard", label: "📊 Дашборд" }, { key: "users", label: "👥 Пользователи" }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "14px 20px", border: "none", background: "none", cursor: "pointer", fontFamily: "Teachers,sans-serif", fontSize: 14, color: tab === t.key ? "#242D96" : "#788CA5", fontWeight: tab === t.key ? 600 : 400, borderBottom: tab === t.key ? "2px solid #242D96" : "2px solid transparent", marginBottom: -1.5 }}>{t.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>

        {tab === "dashboard" && (
          <>
            {!stats ? <div style={{ textAlign: "center", padding: 60 }}><div className="loader" style={{ margin: "0 auto" }} /></div> : <>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                <StatCard label="Всего пользователей" value={stats.totalUsers} icon="👥" />
                <StatCard label="Premium" value={stats.premiumUsers} sub={`${Math.round(stats.premiumUsers / Math.max(stats.totalUsers, 1) * 100)}% от всех`} icon="💎" color="#B8860B" bg="#FFF3CC" />
                <StatCard label="Бесплатных" value={stats.freeUsers} icon="🔓" color="#788CA5" bg="#f3f4f6" />
                <StatCard label="Верифицированных" value={stats.verifiedUsers} icon="✅" color="#029663" bg="#E6FAED" />
                <StatCard label="Telegram" value={stats.telegramLinked} icon="✈️" color="#0088cc" bg="#e8f4fd" />
                <StatCard label="AI фото" value={stats.aiPhotoTotal} icon="📷" sub="всего запросов" />
                <StatCard label="AI планы" value={stats.aiPlanTotal} icon="🗓" sub="всего запросов" />
              </div>

              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
                <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1.5px solid #e8ecf8", flex: "1 1 280px" }}>
                  <h3 style={{ margin: "0 0 16px", color: "#242D96", fontSize: 15, fontFamily: "Teachers,sans-serif" }}>🥧 Состав пользователей</h3>
                  <PieChart segments={[
                    { label: "Premium", value: stats.premiumUsers, color: "#FFD700" },
                    { label: "Бесплатные", value: stats.freeUsers, color: "#BBC8D8" },
                    { label: "Верифицированные (не premium)", value: Math.max(0, stats.verifiedUsers - stats.premiumUsers), color: "#029663" },
                  ].filter(s => s.value > 0)} />
                </div>
                <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1.5px solid #e8ecf8", flex: "2 1 380px" }}>
                  <h3 style={{ margin: "0 0 4px", color: "#242D96", fontSize: 15, fontFamily: "Teachers,sans-serif" }}>📈 Регистрации (30 дней)</h3>
                  <p style={{ margin: "0 0 8px", color: "#BBC8D8", fontSize: 12, fontFamily: "Teachers,sans-serif" }}>Новых пользователей в день</p>
                  <BarChart data={last30} />
                </div>
              </div>

              <Heatmap data={heatmap.registrations} title="📅 Регистрации за год" />
              <Heatmap data={heatmap.aiRequests} title="🤖 AI запросы за год" />
            </>}
          </>
        )}

        {tab === "users" && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
              <input placeholder="🔍 Поиск по имени или email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{ flex: "1 1 240px", padding: "10px 16px", borderRadius: 30, border: "1.5px solid #BBC8D8", fontFamily: "Teachers,sans-serif", fontSize: 14, outline: "none", background: "white" }} />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["all","premium","free","verified"].map(f => (
                  <button key={f} onClick={() => { setFilter(f); setPage(1); }} style={{ padding: "8px 12px", borderRadius: 20, border: "1.5px solid", borderColor: filter === f ? "#242D96" : "#BBC8D8", background: filter === f ? "#242D96" : "white", color: filter === f ? "white" : "#788CA5", cursor: "pointer", fontSize: 12, fontFamily: "Teachers,sans-serif" }}>
                    {{ all: "Все", premium: "💎 Premium", free: "Бесплатные", verified: "✅ Верифицированные" }[f]}
                  </button>
                ))}
              </div>
              <span style={{ color: "#788CA5", fontSize: 13, fontFamily: "Teachers,sans-serif" }}>Всего: {total}</span>
            </div>

            <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #e8ecf8", overflow: "hidden" }}>
              {usersLoading ? <div style={{ textAlign: "center", padding: 40 }}><div className="loader" style={{ margin: "0 auto" }} /></div> :
               users.length === 0 ? <div style={{ textAlign: "center", padding: 60, color: "#788CA5", fontFamily: "Teachers,sans-serif" }}>Не найдено</div> : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f8f9ff", borderBottom: "1.5px solid #e8ecf8" }}>
                        {["Пользователь","Email","Статус","AI фото","AI план","TG","Действия"].map(h => (
                          <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, color: "#788CA5", fontFamily: "Teachers,sans-serif", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={u._id} style={{ borderBottom: i < users.length - 1 ? "1px solid #f3f4f6" : "none" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#fafbff"}
                          onMouseLeave={e => e.currentTarget.style.background = "white"}>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#EEF0FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, fontWeight: 600, color: "#242D96" }}>{u.name?.charAt(0)?.toUpperCase() || "?"}</div>
                              <div>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#242D96", fontFamily: "Teachers,sans-serif" }}>{u.name}</p>
                                {u.role === "admin" && <span style={{ fontSize: 10, background: "#EEF0FB", color: "#242D96", borderRadius: 4, padding: "1px 6px" }}>admin</span>}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 12, color: "#555", fontFamily: "Teachers,sans-serif", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: u.premium ? "#FFF3CC" : "#f3f4f6", color: u.premium ? "#B8860B" : "#888", fontFamily: "Teachers,sans-serif", display: "inline-block", width: "fit-content" }}>{u.premium ? "💎 Premium" : "Free"}</span>
                              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: u.isAccountVerified ? "#E6FAED" : "#fff3f3", color: u.isAccountVerified ? "#029663" : "#e53935", fontFamily: "Teachers,sans-serif", display: "inline-block", width: "fit-content" }}>{u.isAccountVerified ? "✓" : "✗"}</span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: (u.aiPhotoUsed || 0) >= 10 ? "#e53935" : "#555", fontFamily: "Teachers,sans-serif", textAlign: "center" }}>{u.aiPhotoUsed || 0}/10</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: (u.aiPlanUsed || 0) >= 10 ? "#e53935" : "#555", fontFamily: "Teachers,sans-serif", textAlign: "center" }}>{u.aiPlanUsed || 0}/10</td>
                          <td style={{ padding: "12px 16px", textAlign: "center" }}>{u.telegramId ? <span style={{ color: "#0088cc" }}>✓</span> : <span style={{ color: "#BBC8D8" }}>—</span>}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", gap: 5 }}>
                              <button onClick={() => togglePremium(u._id, u.premium)} disabled={actionLoading === u._id + "_p"} style={{ padding: "5px 10px", borderRadius: 8, border: "1.5px solid", borderColor: u.premium ? "#BBC8D8" : "#242D96", background: u.premium ? "white" : "#242D96", color: u.premium ? "#788CA5" : "white", cursor: "pointer", fontSize: 11, fontFamily: "Teachers,sans-serif", whiteSpace: "nowrap" }}>
                                {actionLoading === u._id + "_p" ? "..." : u.premium ? "Снять 💎" : "Дать 💎"}
                              </button>
                              <button onClick={() => resetLimits(u._id)} disabled={actionLoading === u._id + "_r"} style={{ padding: "5px 10px", borderRadius: 8, border: "1.5px solid #BBC8D8", background: "white", color: "#788CA5", cursor: "pointer", fontSize: 11, fontFamily: "Teachers,sans-serif" }}>
                                {actionLoading === u._id + "_r" ? "..." : "↺ AI"}
                              </button>
                              {u.role !== "admin" && <button onClick={() => setDeleteConfirm(u)} style={{ padding: "5px 10px", borderRadius: 8, border: "1.5px solid #ffcdd2", background: "#fff5f5", color: "#e53935", cursor: "pointer", fontSize: 11 }}>🗑</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {pages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "8px 16px", borderRadius: 20, border: "1.5px solid #BBC8D8", background: "white", color: "#242D96", cursor: page === 1 ? "default" : "pointer", opacity: page === 1 ? 0.4 : 1, fontFamily: "Teachers,sans-serif", fontSize: 13 }}>← Назад</button>
                <span style={{ padding: "8px 16px", fontSize: 13, color: "#788CA5", fontFamily: "Teachers,sans-serif" }}>{page} / {pages}</span>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} style={{ padding: "8px 16px", borderRadius: 20, border: "1.5px solid #BBC8D8", background: "white", color: "#242D96", cursor: page === pages ? "default" : "pointer", opacity: page === pages ? 0.4 : 1, fontFamily: "Teachers,sans-serif", fontSize: 13 }}>Вперёд →</button>
              </div>
            )}
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setDeleteConfirm(null)}>
          <div style={{ background: "white", borderRadius: 20, padding: 28, maxWidth: 340, width: "90%", textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ color: "#242D96", fontFamily: "Teachers,sans-serif", margin: "0 0 8px" }}>Удалить пользователя?</h3>
            <p style={{ color: "#788CA5", fontSize: 13, fontFamily: "Teachers,sans-serif", margin: "0 0 20px" }}>{deleteConfirm.name} ({deleteConfirm.email})</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "10px", borderRadius: 50, border: "1.5px solid #BBC8D8", background: "white", color: "#788CA5", cursor: "pointer", fontFamily: "Teachers,sans-serif" }}>Отмена</button>
              <button onClick={() => deleteUser(deleteConfirm._id)} disabled={actionLoading === deleteConfirm._id + "_d"} style={{ flex: 1, padding: "10px", borderRadius: 50, border: "none", background: "#e53935", color: "white", cursor: "pointer", fontFamily: "Teachers,sans-serif" }}>
                {actionLoading === deleteConfirm._id + "_d" ? "..." : "Удалить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;