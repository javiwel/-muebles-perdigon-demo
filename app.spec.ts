import { test, expect } from "@playwright/test";
async function navigate(page: any, name: string) {
  const menu = page.getByRole("button", { name: "Abrir menú" });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole("navigation")
    .getByRole("button", {
      name: name === "Trabajos" ? /^Trabajos/ : name,
      exact: name !== "Trabajos",
    })
    .click();
}
test("alta incompleta, edición, persistencia e historial", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Buenos días, Mariluz." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Nuevo trabajo", exact: true })
    .click();
  await page.getByRole("button", { name: "Guardar trabajo" }).click();
  await expect(page.getByRole("status")).toContainText("guardado");
  await navigate(page, "Trabajos");
  await page.getByRole("button", { name: /Aviso sin descripción/ }).click();
  await page
    .getByLabel("Cliente", { exact: true })
    .fill("Cliente prueba automatizada");
  await page
    .getByLabel("Descripción", { exact: true })
    .fill("Montaje de ejemplo automatizado");
  await page.getByRole("button", { name: "Guardar trabajo" }).click();
  await page.reload();
  await navigate(page, "Trabajos");
  await expect(
    page.getByRole("button", { name: /Montaje de ejemplo automatizado/ }),
  ).toBeVisible();
  await navigate(page, "Historial");
  await expect(page.getByText(/actualizó el trabajo/)).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("programación validada y agenda", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Nuevo trabajo", exact: true })
    .click();
  await page
    .getByLabel("Descripción", { exact: true })
    .fill("Entrega de prueba");
  await page
    .getByRole("combobox", { name: "Estado", exact: true })
    .selectOption("Programado");
  await page.getByRole("button", { name: "Guardar trabajo" }).click();
  await expect(page.getByRole("alert")).toContainText("fecha y hora");
  const date = await page.evaluate(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  await page.getByLabel("Fecha", { exact: true }).fill(date);
  await page.getByLabel("Hora", { exact: true }).fill("14:00");
  await page.getByLabel("Emilio", { exact: true }).check();
  await page.getByRole("button", { name: "Guardar trabajo" }).click();
  await navigate(page, "Agenda");
  await expect(
    page.getByRole("button", { name: /Entrega de prueba/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Semana", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /Entrega de prueba/ }),
  ).toBeVisible();
  await navigate(page, "Rutas por trabajador");
  await expect(
    page.getByRole("button", { name: "14:00 · Entrega de prueba" }),
  ).toBeVisible();
});
test("borrado restringido al perfil demo Mariluz y registro conservado", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("combobox", { name: /Usuario de demostración/ })
    .selectOption("Emilio");
  await page.getByRole("button", { name: /Entrega de sofá/ }).click();
  await expect(
    page.getByRole("button", { name: "Eliminar", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Cerrar ficha" }).click();
  await page
    .getByRole("combobox", { name: /Usuario de demostración/ })
    .selectOption("Mariluz");
  await page.getByRole("button", { name: /Entrega de sofá/ }).click();
  page.on("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Eliminar", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("eliminado");
  await navigate(page, "Historial");
  await expect(page.getByText(/eliminó el trabajo/)).toBeVisible();
});
