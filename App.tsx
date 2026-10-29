import { useState } from "react";
import {
  Armchair,
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  MapPin,
  History,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Clock,
  Users,
  Truck,
  Wrench,
  Package,
  Check,
  X,
  SlidersHorizontal,
  ArrowRight,
  Menu,
  AlertCircle,
  Download,
} from "lucide-react";
import {
  blank,
  commit,
  day,
  matches,
  seed,
  statuses,
  stores,
  types,
  validate,
  workers,
  type Data,
  type Job,
} from "./model";
const key = "perdigon-demo-v1";
const nav = [
  { name: "Inicio", icon: LayoutDashboard },
  { name: "Trabajos", icon: ClipboardList },
  { name: "Agenda", icon: CalendarDays },
  { name: "Rutas por trabajador", icon: MapPin },
  { name: "Historial", icon: History },
];
const isOpen = (j: Job) => !["Realizado", "Cancelado"].includes(j.status);
const dateLabel = (date: string) =>
  new Date(date + "T12:00:00").toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
const badge = (s: string) =>
  s === "En curso"
    ? "blue"
    : s === "Programado"
      ? "green"
      : s === "Esperando material"
        ? "orange"
        : s === "Realizado"
          ? "done"
          : "gray";
export default function App() {
  const [data, setData] = useState<Data>(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : seed();
    } catch {
      return seed();
    }
  });
  const [page, setPage] = useState("Inicio"),
    [actor, setActor] = useState("Mariluz"),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState(""),
    [store, setStore] = useState(""),
    [worker, setWorker] = useState(""),
    [editing, setEditing] = useState<Job | null>(null),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [selectedDay, setDay] = useState(day()),
    [weekly, setWeekly] = useState(false),
    [mobile, setMobile] = useState(false),
    [quickFilter, setQuickFilter] = useState("");
  const jobs = data.jobs.filter(
    (j) =>
      matches(j, query) &&
      (!status || j.status === status) &&
      (!store || j.store === store) &&
      (!worker || j.assigned.includes(worker)),
  );
  const today = data.jobs.filter((j) => j.date === day() && isOpen(j));
  const pending = data.jobs.filter((j) =>
    ["Nuevo", "Pendiente de programar"].includes(j.status),
  );
  function persist(next: Data) {
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setData(next);
      return true;
    } catch {
      setError(
        "No se ha podido guardar. El almacenamiento del navegador está lleno o bloqueado.",
      );
      return false;
    }
  }
  function save() {
    if (!editing) return;
    const e = validate(editing);
    if (e) {
      setError(e);
      return;
    }
    if (persist(commit(data, editing, actor))) {
      setEditing(null);
      setError("");
      setNotice("Trabajo guardado en este navegador.");
    }
  }
  function changePage(p: string) {
    setPage(p);
    setQuickFilter("");
    setMobile(false);
  }
  function metric(filter: string) {
    setPage("Trabajos");
    setStatus("");
    setQuickFilter(filter);
  }
  const filtered = jobs.filter((j) =>
    page === "Historial"
      ? ["Realizado", "Cancelado"].includes(j.status)
      : quickFilter === "today"
        ? j.date === day() && isOpen(j)
        : quickFilter === "unassigned"
          ? j.assigned.length === 0 && isOpen(j)
          : quickFilter === "pending"
            ? ["Nuevo", "Pendiente de programar"].includes(j.status)
            : quickFilter === "material"
              ? j.status === "Esperando material"
              : true,
  );
  function card(j: Job) {
    return (
      <button
        className="job-card"
        key={j.id}
        onClick={() => {
          setEditing({ ...j });
          setError("");
        }}
      >
        <div
          className={"type-icon " + (j.type === "Entrega" ? "green-icon" : "")}
        >
          {j.type === "Entrega" ? (
            <Truck size={20} />
          ) : j.type === "Montaje" ? (
            <Package size={20} />
          ) : (
            <Wrench size={20} />
          )}
        </div>
        <div className="job-content">
          <div className="job-top">
            <span className="eyebrow">{j.type}</span>
            <span className={"badge " + badge(j.status)}>
              <i />
              {j.status}
            </span>
          </div>
          <h3>{j.description || "Aviso sin descripción"}</h3>
          <div className="client">
            {j.client || "Cliente pendiente"}{" "}
            <span>· {j.store.split(" · ")[1]}</span>
          </div>
          <div className="job-meta">
            <span>
              <Clock size={14} />
              {j.time || "Sin hora"} · {j.duration} min
            </span>
            <span>
              <Users size={14} />
              {j.assigned.join(" y ") || "Sin asignar"}
            </span>
          </div>
        </div>
        <ChevronRight className="card-arrow" size={18} />
      </button>
    );
  }
  return (
    <div className="app">
      <aside className={mobile ? "sidebar open" : "sidebar"}>
        <a className="brand" href="#" onClick={() => changePage("Inicio")}>
          <span className="brand-icon">
            <Armchair size={27} />
          </span>
          <span>
            Muebles <strong>Perdigón</strong>
          </span>
        </a>
        <div className="workspace-label">ESPACIO DE TRABAJO</div>
        <nav>
          {nav.map((n) => (
            <button
              key={n.name}
              className={page === n.name ? "nav-item active" : "nav-item"}
              onClick={() => changePage(n.name)}
            >
              <n.icon size={20} />
              {n.name}
              {n.name === "Trabajos" && (
                <span className="nav-count">
                  {data.jobs.filter(isOpen).length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="team-label">UN EQUIPO, TRES TIENDAS</div>
          <div className="team-avatars">
            {workers.map((w, i) => (
              <span title={w} key={w} className={"avatar av" + i}>
                {w === "Miguel padre" ? "MP" : w.slice(0, 1)}
              </span>
            ))}
          </div>
          <p>Todo el trabajo, en un solo lugar.</p>
          <div className="demo-label">
            <span /> Modo demostración
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Abrir menú"
            onClick={() => setMobile(!mobile)}
          >
            <Menu />
          </button>
          <span className="breadcrumb">
            Mi espacio <ChevronRight size={14} /> <b>{page}</b>
          </span>
          <div className="topbar-right">
            <span className="local-status">
              <span /> Datos locales
            </span>
            <div className="user-avatar">
              {actor === "Mariluz"
                ? "MA"
                : actor === "Miguel padre"
                  ? "MP"
                  : actor.slice(0, 2).toUpperCase()}
            </div>
            <label className="user-switch">
              <span className="sr-only">Usuario de demostración</span>
              <select value={actor} onChange={(e) => setActor(e.target.value)}>
                {workers.map((w) => (
                  <option key={w}>{w}</option>
                ))}
              </select>
              <small>Perfil de demostración</small>
            </label>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="overline">GESTIÓN DE TRABAJOS</div>
              <h1>
                {page === "Inicio" ? "Buenos días, " + actor : page}
                <span className="heading-dot">.</span>
              </h1>
              <p>
                {page === "Inicio"
                  ? "Así va el día. Vamos a ponerlo todo en orden."
                  : page === "Agenda"
                    ? "Organiza el equipo y los próximos trabajos."
                    : page === "Rutas por trabajador"
                      ? "Consulta los destinos de cada miembro del equipo."
                      : page === "Historial"
                        ? "Trabajos terminados y registro de modificaciones."
                        : "Todos los avisos, siempre a mano."}
              </p>
            </div>
            <button
              className="primary"
              onClick={() => {
                setEditing(blank());
                setError("");
              }}
            >
              <Plus size={19} /> Nuevo trabajo
            </button>
          </div>
          {notice && (
            <div className="notice" role="status">
              <Check size={17} />
              {notice}
              <button aria-label="Cerrar mensaje" onClick={() => setNotice("")}>
                <X size={16} />
              </button>
            </div>
          )}
          {page === "Inicio" && (
            <>
              <div className="today-line">
                <CalendarDays size={17} />
                <span>{dateLabel(day())}</span>
                <span className="demo-note">
                  Datos ficticios · Solo en este dispositivo
                </span>
              </div>
              <section className="metrics">
                {[
                  {
                    label: "Pendientes de programar",
                    n: pending.length,
                    icon: ClipboardList,
                    filter: "pending",
                    color: "sand",
                    sub: "Por organizar",
                  },
                  {
                    label: "Programados para hoy",
                    n: today.length,
                    icon: CalendarDays,
                    filter: "today",
                    color: "mint",
                    sub: "La agenda de hoy",
                  },
                  {
                    label: "Sin asignar",
                    n: data.jobs.filter((j) => !j.assigned.length && isOpen(j))
                      .length,
                    icon: Users,
                    filter: "unassigned",
                    color: "lavender",
                    sub: "Necesitan un responsable",
                  },
                  {
                    label: "Esperando material",
                    n: data.jobs.filter(
                      (j) => j.status === "Esperando material",
                    ).length,
                    icon: Package,
                    filter: "material",
                    color: "peach",
                    sub: "Pendientes de recibir",
                  },
                ].map((m) => (
                  <button
                    className="metric"
                    key={m.filter}
                    onClick={() => metric(m.filter)}
                  >
                    <div className="metric-top">
                      <span>{m.label}</span>
                      <span className={"metric-icon " + m.color}>
                        <m.icon size={19} />
                      </span>
                    </div>
                    <strong>{m.n.toString().padStart(2, "0")}</strong>
                    <div className="metric-bottom">
                      {m.sub}
                      <ArrowUpRight size={16} />
                    </div>
                  </button>
                ))}
              </section>
              <div className="dashboard-grid">
                <section className="panel">
                  <div className="section-heading">
                    <div>
                      <h2>
                        La agenda de hoy{" "}
                        <span className="number-badge">{today.length}</span>
                      </h2>
                      <p>Un vistazo a lo que tenemos por delante.</p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => changePage("Agenda")}
                    >
                      Ver agenda <ArrowRight size={16} />
                    </button>
                  </div>
                  <div className="cards">
                    {today
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map(card)}
                    {!today.length && (
                      <div className="empty">
                        Hoy no hay trabajos programados.
                      </div>
                    )}
                  </div>
                  <div className="panel-footer">
                    <span className="small-dot" /> Todo listo para seguir
                    avanzando
                  </div>
                </section>
                <div className="right-column">
                  <section className="attention-panel">
                    <div className="section-heading">
                      <h2>
                        <AlertCircle size={19} /> Necesitan atención
                      </h2>
                    </div>
                    {data.jobs
                      .filter((j) => j.priority && isOpen(j))
                      .map((j) => (
                        <button
                          className="attention-item"
                          key={j.id}
                          onClick={() => setEditing({ ...j })}
                        >
                          <span className="priority-label">PRIORITARIO</span>
                          <h3>{j.description}</h3>
                          <p>{j.client}</p>
                          <span className={"badge " + badge(j.status)}>
                            {j.status}
                          </span>
                          <ChevronRight size={17} />
                        </button>
                      ))}
                    <button
                      className="attention-all"
                      onClick={() => metric("pending")}
                    >
                      Ver trabajos pendientes <ArrowRight size={16} />
                    </button>
                  </section>
                  <section className="quick-note">
                    <div className="note-icon">
                      <ClipboardList size={23} />
                    </div>
                    <h3>¿Ha entrado un aviso?</h3>
                    <p>
                      No hace falta tener todos los datos.
                      <br />
                      Guárdalo ahora y complétalo después.
                    </p>
                    <button onClick={() => setEditing(blank())}>
                      Crear aviso rápido <Plus size={17} />
                    </button>
                  </section>
                </div>
              </div>
            </>
          )}
          {page !== "Inicio" && (
            <>
              <div className="filters">
                <label className="search">
                  <Search size={18} />
                  <input
                    placeholder="Buscar cliente, dirección o trabajo…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <SlidersHorizontal size={18} />
                <select
                  aria-label="Filtrar estado"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">Todos los estados</option>
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <select
                  aria-label="Filtrar tienda"
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                >
                  <option value="">Todas las tiendas</option>
                  {stores.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <select
                  aria-label="Filtrar trabajador"
                  value={worker}
                  onChange={(e) => setWorker(e.target.value)}
                >
                  <option value="">Todo el equipo</option>
                  {workers.map((w) => (
                    <option key={w}>{w}</option>
                  ))}
                </select>
                {quickFilter && (
                  <button
                    className="text-button"
                    onClick={() => setQuickFilter("")}
                  >
                    Quitar filtro <X size={14} />
                  </button>
                )}
              </div>
              {page === "Trabajos" && (
                <section className="panel">
                  <div className="section-heading">
                    <h2>
                      {quickFilter
                        ? "Trabajos filtrados"
                        : "Todos los trabajos"}{" "}
                      <span className="number-badge">{filtered.length}</span>
                    </h2>
                  </div>
                  <div className="job-grid">{filtered.map(card)}</div>
                  {!filtered.length && (
                    <p className="empty">No hay trabajos con estos filtros.</p>
                  )}
                </section>
              )}
              {page === "Agenda" && (
                <>
                  <div className="agenda-toolbar">
                    <div>
                      <button
                        className="icon-button"
                        aria-label="Día anterior"
                        onClick={() => {
                          const d = new Date(selectedDay + "T12:00");
                          d.setDate(d.getDate() - (weekly ? 7 : 1));
                          setDay(
                            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
                          );
                        }}
                      >
                        <ChevronLeft />
                      </button>
                      <input
                        aria-label="Fecha de agenda"
                        type="date"
                        value={selectedDay}
                        onChange={(e) => setDay(e.target.value)}
                      />
                      <button
                        className="icon-button"
                        aria-label="Día siguiente"
                        onClick={() => {
                          const d = new Date(selectedDay + "T12:00");
                          d.setDate(d.getDate() + (weekly ? 7 : 1));
                          setDay(
                            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
                          );
                        }}
                      >
                        <ChevronRight />
                      </button>
                      <button
                        className="text-button"
                        onClick={() => setDay(day())}
                      >
                        Hoy
                      </button>
                    </div>
                    <div className="segmented">
                      <button
                        className={!weekly ? "selected" : ""}
                        onClick={() => setWeekly(false)}
                      >
                        Día
                      </button>
                      <button
                        className={weekly ? "selected" : ""}
                        onClick={() => setWeekly(true)}
                      >
                        Semana
                      </button>
                    </div>
                  </div>
                  <div className={weekly ? "week-grid" : "day-grid"}>
                    {Array.from({ length: weekly ? 7 : 1 }, (_, i) => {
                      const d = new Date(selectedDay + "T12:00");
                      if (weekly) {
                        const weekday = (d.getDay() + 6) % 7;
                        d.setDate(d.getDate() - weekday + i);
                      }
                      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                      const list = jobs
                        .filter((j) => j.date === value && isOpen(j))
                        .sort((a, b) => a.time.localeCompare(b.time));
                      return (
                        <section className="panel agenda-day" key={value}>
                          <h2>{dateLabel(value)}</h2>
                          {list.map(card)}
                          {!list.length && (
                            <p className="empty">Sin trabajos programados</p>
                          )}
                        </section>
                      );
                    })}
                  </div>
                </>
              )}
              {page === "Rutas por trabajador" && (
                <div className="routes">
                  <label className="route-date">
                    Fecha de la ruta{" "}
                    <input
                      type="date"
                      value={selectedDay}
                      onChange={(e) => setDay(e.target.value)}
                    />
                  </label>
                  {workers
                    .filter((w) => !worker || w === worker)
                    .map((w) => {
                      const list = jobs
                        .filter(
                          (j) =>
                            j.assigned.includes(w) &&
                            j.date === selectedDay &&
                            isOpen(j),
                        )
                        .sort((a, b) => a.time.localeCompare(b.time));
                      return (
                        <section className="panel" key={w}>
                          <div className="section-heading">
                            <h2>
                              <Users size={20} />
                              {w}
                            </h2>
                            <span>{list.length} trabajos</span>
                          </div>
                          {list.map((j, i) => (
                            <div className="route-stop" key={j.id}>
                              <span className="stop-number">{i + 1}</span>
                              <div>
                                <button
                                  className="text-button"
                                  onClick={() => setEditing({ ...j })}
                                >
                                  {j.time} · {j.description || "Aviso"}
                                </button>
                                <p>{j.address || "Dirección pendiente"}</p>
                              </div>
                              {j.address && (
                                <a
                                  className="maps-link"
                                  target="_blank"
                                  rel="noreferrer"
                                  href={
                                    "https://www.google.com/maps/search/?api=1&query=" +
                                    encodeURIComponent(j.address)
                                  }
                                >
                                  <MapPin size={17} /> Google Maps{" "}
                                  <ArrowUpRight size={14} />
                                </a>
                              )}
                            </div>
                          ))}
                          {!list.length && (
                            <p className="empty">
                              Sin trabajos para esta fecha.
                            </p>
                          )}
                        </section>
                      );
                    })}
                  <p className="muted">
                    Orden por hora prevista. Los destinos de demostración son
                    ficticios; no se optimizan rutas.
                  </p>
                </div>
              )}
              {page === "Historial" && (
                <>
                  <section className="panel">
                    <div className="section-heading">
                      <h2>Trabajos terminados y cancelados</h2>
                    </div>
                    <div className="job-grid">{filtered.map(card)}</div>
                    {!filtered.length && (
                      <p className="empty">
                        No hay trabajos terminados con estos filtros.
                      </p>
                    )}
                  </section>
                  <section className="panel history-panel">
                    <div className="section-heading">
                      <h2>Registro de modificaciones</h2>
                      <button
                        className="text-button"
                        onClick={() => {
                          const url = URL.createObjectURL(
                            new Blob([JSON.stringify(data, null, 2)], {
                              type: "application/json",
                            }),
                          );
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "perdigon-demo.json";
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        <Download size={16} /> Exportar datos demo
                      </button>
                    </div>
                    {data.events.map((e) => (
                      <details className="event" key={e.id}>
                        <summary>
                          <span className="event-dot" />
                          <strong>{e.actor}</strong> · {e.action.toLowerCase()}{" "}
                          ·{" "}
                          {e.after?.description ||
                            e.before?.description ||
                            "Aviso"}
                          <small>
                            {new Date(e.at).toLocaleString("es-ES")}
                          </small>
                        </summary>
                        <div className="event-details">
                          {Object.keys(e.after || e.before || {})
                            .filter(
                              (k) =>
                                JSON.stringify(e.before?.[k as keyof Job]) !==
                                JSON.stringify(e.after?.[k as keyof Job]),
                            )
                            .map((k) => (
                              <p key={k}>
                                <b>{k}</b>:{" "}
                                {JSON.stringify(
                                  e.before?.[k as keyof Job] ?? "—",
                                )}{" "}
                                →{" "}
                                {JSON.stringify(
                                  e.after?.[k as keyof Job] ?? "—",
                                )}
                              </p>
                            ))}
                        </div>
                      </details>
                    ))}
                    {!data.events.length && (
                      <p className="empty">
                        Las altas, modificaciones y eliminaciones aparecerán
                        aquí.
                      </p>
                    )}
                  </section>
                </>
              )}
            </>
          )}
          <footer className="main-footer">
            <span>
              <Armchair size={15} /> Muebles Perdigón
            </span>
            <span>Menos líos. Más trabajo bien hecho.</span>
            <span>Versión 1.0 · Demo local</span>
          </footer>
        </main>
      </div>
      {editing && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditing(null);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-title"
            onKeyDown={(e) => {
              if (e.key === "Escape") setEditing(null);
            }}
          >
            <div className="modal-heading">
              <div>
                <div className="overline">FICHA DE TRABAJO</div>
                <h2 id="form-title">
                  {data.jobs.some((j) => j.id === editing.id)
                    ? "Detalle del trabajo"
                    : "Nuevo aviso"}
                </h2>
                <p>Puedes guardar sin completar todos los datos.</p>
              </div>
              <button
                className="icon-button"
                aria-label="Cerrar ficha"
                onClick={() => setEditing(null)}
              >
                <X />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              <div className="form-grid">
                {(
                  [
                    ["client", "Cliente", "text"],
                    ["phone", "Teléfono", "tel"],
                    ["address", "Dirección", "text"],
                  ] as const
                ).map(([k, label, type]) => (
                  <label key={k} className={k === "address" ? "full" : ""}>
                    {label}
                    <input
                      autoFocus={k === "client"}
                      type={type}
                      value={editing[k]}
                      onChange={(e) =>
                        setEditing({ ...editing, [k]: e.target.value })
                      }
                      placeholder={
                        k === "client" ? "Nombre del cliente (opcional)" : ""
                      }
                    />
                  </label>
                ))}
                <label>
                  Tienda
                  <select
                    value={editing.store}
                    onChange={(e) =>
                      setEditing({ ...editing, store: e.target.value })
                    }
                  >
                    {stores.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Tipo de trabajo
                  <select
                    value={editing.type}
                    onChange={(e) =>
                      setEditing({ ...editing, type: e.target.value })
                    }
                  >
                    {types.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label className="full">
                  Descripción
                  <textarea
                    rows={3}
                    value={editing.description}
                    onChange={(e) =>
                      setEditing({ ...editing, description: e.target.value })
                    }
                    placeholder="¿Qué hay que hacer?"
                  />
                </label>
                <label className="full">
                  Disponibilidad del cliente
                  <input
                    value={editing.availability}
                    onChange={(e) =>
                      setEditing({ ...editing, availability: e.target.value })
                    }
                  />
                </label>
                <label>
                  Estado
                  <select
                    value={editing.status}
                    onChange={(e) =>
                      setEditing({ ...editing, status: e.target.value })
                    }
                  >
                    {statuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Duración estimada (min)
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={editing.duration}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        duration: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  Fecha
                  <input
                    type="date"
                    value={editing.date}
                    onChange={(e) =>
                      setEditing({ ...editing, date: e.target.value })
                    }
                  />
                </label>
                <label>
                  Hora
                  <input
                    type="time"
                    value={editing.time}
                    onChange={(e) =>
                      setEditing({ ...editing, time: e.target.value })
                    }
                  />
                </label>
                <label>
                  Número de operarios
                  <input
                    type="number"
                    min="1"
                    max="4"
                    value={editing.crew}
                    onChange={(e) =>
                      setEditing({ ...editing, crew: Number(e.target.value) })
                    }
                  />
                </label>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={editing.priority}
                    onChange={(e) =>
                      setEditing({ ...editing, priority: e.target.checked })
                    }
                  />{" "}
                  Prioritario
                </label>
                <fieldset className="full">
                  <legend>Trabajadores asignados</legend>
                  <div className="worker-options">
                    {workers.map((w) => (
                      <label className="checkbox" key={w}>
                        <input
                          type="checkbox"
                          checked={editing.assigned.includes(w)}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              assigned: e.target.checked
                                ? [...editing.assigned, w]
                                : editing.assigned.filter((x) => x !== w),
                            })
                          }
                        />
                        {w}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <div className="form-actions">
                {actor === "Mariluz" &&
                  data.jobs.some((j) => j.id === editing.id) && (
                    <button
                      type="button"
                      className="danger"
                      onClick={() => {
                        if (
                          confirm(
                            "¿Eliminar este trabajo? Quedará constancia en el historial local.",
                          )
                        ) {
                          if (persist(commit(data, editing, actor, true))) {
                            setEditing(null);
                            setNotice(
                              "Trabajo eliminado. El historial se conserva.",
                            );
                          }
                        }
                      }}
                    >
                      Eliminar
                    </button>
                  )}
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setEditing(null)}
                >
                  Cancelar
                </button>
                <button className="primary" type="submit">
                  <Check size={18} /> Guardar trabajo
                </button>
              </div>
              <p className="form-disclaimer">
                Demostración local: el perfil seleccionado no es una
                autenticación. Google y los permisos de servidor están
                pendientes de configurar y probar.
              </p>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
