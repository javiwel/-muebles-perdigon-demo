export const workers = ["Mariluz", "Miguel padre", "Miguel", "Emilio"] as const;
export const stores = [
  "Tienda 1 · Centro",
  "Tienda 2 · Norte",
  "Tienda 3 · Sur",
];
export const types = [
  "Entrega",
  "Montaje",
  "Reparación",
  "Incidencia",
  "Recogida",
  "Instalación de cocina",
  "Fontanería",
  "Aire acondicionado",
];
export const statuses = [
  "Nuevo",
  "Pendiente de programar",
  "Programado",
  "En curso",
  "Esperando material",
  "Realizado",
  "Cancelado",
];
export type Job = {
  id: string;
  client: string;
  phone: string;
  address: string;
  store: string;
  type: string;
  description: string;
  availability: string;
  duration: number;
  crew: number;
  assigned: string[];
  status: string;
  date: string;
  time: string;
  priority: boolean;
};
export type Event = {
  id: string;
  jobId: string;
  at: string;
  actor: string;
  action: string;
  before: Job | null;
  after: Job | null;
};
export type Data = { jobs: Job[]; events: Event[] };
export function newId() {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
        b.toString(16).padStart(2, "0"),
      ).join("");
}
export function day(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function blank(): Job {
  return {
    id: newId(),
    client: "",
    phone: "",
    address: "",
    store: stores[0],
    type: "Entrega",
    description: "",
    availability: "",
    duration: 60,
    crew: 1,
    assigned: [],
    status: "Nuevo",
    date: "",
    time: "",
    priority: false,
  };
}
export function seed(): Data {
  const rows: [string, string, string, string, string[], number, boolean][] = [
    [
      "Entrega de sofá y retirada del antiguo",
      "Cliente de ejemplo 01",
      "Entrega",
      "Programado",
      ["Miguel", "Emilio"],
      0,
      false,
    ],
    [
      "Montaje de armario de dormitorio",
      "Cliente de ejemplo 02",
      "Montaje",
      "En curso",
      ["Miguel padre"],
      0,
      true,
    ],
    [
      "Lavadora: revisar desagüe",
      "Cliente de ejemplo 03",
      "Reparación",
      "Pendiente de programar",
      [],
      1,
      true,
    ],
    [
      "Instalación de cocina completa",
      "Cliente de ejemplo 04",
      "Instalación de cocina",
      "Esperando material",
      ["Miguel", "Emilio"],
      2,
      false,
    ],
    [
      "Entrega de frigorífico",
      "Cliente de ejemplo 05",
      "Entrega",
      "Programado",
      ["Emilio"],
      0,
      false,
    ],
    [
      "Sustituir grifo de cocina",
      "Cliente de ejemplo 06",
      "Fontanería",
      "Nuevo",
      [],
      1,
      false,
    ],
    [
      "Revisión de aire acondicionado",
      "Cliente de ejemplo 07",
      "Aire acondicionado",
      "Programado",
      ["Miguel padre"],
      1,
      false,
    ],
    [
      "Recogida de mesa en tienda",
      "Cliente de ejemplo 08",
      "Recogida",
      "Realizado",
      ["Miguel"],
      -1,
      false,
    ],
  ];
  return {
    jobs: rows.map((r, i) => ({
      ...blank(),
      id: `demo-${i + 1}`,
      description: r[0],
      client: r[1],
      type: r[2],
      status: r[3],
      assigned: r[4],
      date: ["Nuevo", "Pendiente de programar", "Esperando material"].includes(
        r[3],
      )
        ? ""
        : day(r[5]),
      time: [
        "09:00",
        "10:30",
        "11:00",
        "08:30",
        "12:00",
        "16:00",
        "10:00",
        "09:00",
      ][i],
      address: `Calle de Ejemplo, ${i + 1} · Ciudad de demostración`,
      store: stores[i % 3],
      duration: i === 3 ? 240 : 60,
      crew: r[4].length || 1,
      availability: "Por la mañana. Llamar antes de ir.",
      priority: r[6],
    })),
    events: [],
  };
}
export function matches(j: Job, q: string) {
  return [
    j.id,
    j.client,
    j.phone,
    j.address,
    j.description,
    j.type,
    ...j.assigned,
  ]
    .join(" ")
    .toLocaleLowerCase("es")
    .includes(q.toLocaleLowerCase("es"));
}
export function commit(
  data: Data,
  job: Job,
  actor: string,
  remove = false,
): Data {
  if (remove && actor !== "Mariluz")
    throw new Error("Solo Mariluz puede eliminar en la demostración.");
  const old = data.jobs.find((j) => j.id === job.id);
  return {
    jobs: remove
      ? data.jobs.filter((j) => j.id !== job.id)
      : old
        ? data.jobs.map((j) => (j.id === job.id ? job : j))
        : [job, ...data.jobs],
    events: [
      {
        id: newId(),
        jobId: job.id,
        at: new Date().toISOString(),
        actor,
        action: remove
          ? "Eliminó el trabajo"
          : old
            ? "Actualizó el trabajo"
            : "Creó el trabajo",
        before: old ?? null,
        after: remove ? null : job,
      },
      ...data.events,
    ],
  };
}
export function validate(j: Job) {
  if (j.status === "Programado" && (!j.date || !j.time))
    return "Indica fecha y hora para programar el trabajo.";
  if (
    !Number.isInteger(j.duration) ||
    !Number.isInteger(j.crew) ||
    j.duration < 15 ||
    j.crew < 1 ||
    j.crew > 4
  )
    return "La duración mínima es de 15 minutos y se necesitan entre uno y cuatro operarios.";
  return "";
}
