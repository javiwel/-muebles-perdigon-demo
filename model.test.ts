import { describe, it, expect } from "vitest";
import { blank, commit, matches, seed, validate } from "../src/model";
describe("Gestión local", () => {
  it("permite guardar avisos incompletos y conserva autor e instantánea", () => {
    const j = blank();
    expect(validate(j)).toBe("");
    const next = commit({ jobs: [], events: [] }, j, "Emilio");
    expect(next.jobs).toEqual([j]);
    expect(next.events[0]).toMatchObject({
      actor: "Emilio",
      before: null,
      after: j,
    });
  });
  it("exige fecha y hora al programar", () => {
    expect(validate({ ...blank(), status: "Programado" })).not.toBe("");
  });
  it("conserva los valores anteriores al actualizar", () => {
    const j = blank();
    const state = commit(
      { jobs: [j], events: [] },
      { ...j, client: "Ejemplo" },
      "Miguel",
    );
    expect(state.events[0].before?.client).toBe("");
    expect(state.jobs[0].client).toBe("Ejemplo");
    expect(j.client).toBe("");
  });
  it("rechaza el borrado demo por otro perfil y mantiene auditoría al borrar", () => {
    const j = blank();
    const data = { jobs: [j], events: [] };
    expect(() => commit(data, j, "Emilio", true)).toThrow();
    const next = commit(data, j, "Mariluz", true);
    expect(next.jobs).toHaveLength(0);
    expect(next.events[0].before).toEqual(j);
    expect(next.events[0].after).toBeNull();
  });
  it("busca sin distinguir mayúsculas y genera solo ejemplos", () => {
    const j = seed().jobs[0];
    expect(matches(j, "CLIENTE DE EJEMPLO")).toBe(true);
    expect(matches(j, "inexistente")).toBe(false);
    expect(seed().jobs.every((j) => !j.phone)).toBe(true);
  });
});
