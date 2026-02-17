import { test, expect } from "@playwright/test";

async function dragCardToColumn(page, cardTestId, destColumnTestId) {
  await page.evaluate(
    async ({ cardId, colId }) => {
      // ── locate elements ────────────────────────────────────────────────
      const card = document.querySelector(`[data-testid="${cardId}"]`);
      const col = document.querySelector(`[data-testid="${colId}"]`);
      if (!card || !col)
        throw new Error(`Element not found: ${cardId} or ${colId}`);

      const cardRect = card.getBoundingClientRect();
      const colRect = col.getBoundingClientRect();

      const startX = cardRect.left + cardRect.width / 2;
      const startY = cardRect.top + cardRect.height / 2;
      const endX = colRect.left + colRect.width / 2;
      const endY = colRect.top + colRect.height / 2;

      function fire(el, type, x, y) {
        el.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y,
            pointerId: 1,
            isPrimary: true,
            pressure: type === "pointerup" ? 0 : 0.5,
          }),
        );
      }

      // 1. Press on the card
      fire(card, "pointerdown", startX, startY);
      await new Promise((r) => setTimeout(r, 50));

      // 2. Small initial move (triggers drag-start in the library)
      fire(document, "pointermove", startX + 1, startY + 1);
      await new Promise((r) => setTimeout(r, 50));

      // 3. Glide to destination in steps
      const STEPS = 20;
      for (let i = 1; i <= STEPS; i++) {
        const x = startX + ((endX - startX) * i) / STEPS;
        const y = startY + ((endY - startY) * i) / STEPS;
        fire(document, "pointermove", x, y);
        await new Promise((r) => setTimeout(r, 20));
      }

      // 4. Linger over the target so the library registers the drop zone
      await new Promise((r) => setTimeout(r, 100));

      // 5. Release
      fire(document, "pointerup", endX, endY);
      await new Promise((r) => setTimeout(r, 50));
    },
    { cardId: cardTestId, colId: destColumnTestId },
  );

  // Wait for React + Socket.IO to flush
  await page.waitForTimeout(800);
}

async function addTask(
  page,
  { title, priority = "Medium", category = "Feature" } = {},
) {
  await page.getByTestId("task-title-input").fill(title);
  await page.getByTestId("priority-select").selectOption(priority);
  await page.getByTestId("category-select").selectOption(category);
  await page.getByTestId("add-task-btn").click();

  // Wait until the card appears anywhere on the board
  await expect(
    page.locator(`[data-testid^="task-card"]`).filter({ hasText: title }),
  ).toBeVisible({ timeout: 8000 });
}

async function getCardTestId(page, title) {
  const card = page
    .locator(`[data-testid^="task-card"]`)
    .filter({ hasText: title })
    .first();
  const testId = await card.getAttribute("data-testid");
  if (!testId) throw new Error(`Could not find task card for title: ${title}`);
  return testId;
}

test.describe("Kanban Board – Drag and Drop", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    await expect(page.getByTestId("kanban-board")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId("column-Todo")).toBeVisible();
    await expect(page.getByTestId("column-In-Progress")).toBeVisible();
    await expect(page.getByTestId("column-Done")).toBeVisible();
  });

  test("renders all three column headers correctly", async ({ page }) => {
    await expect(page.getByTestId("column-header-Todo")).toHaveText("Todo");
    await expect(page.getByTestId("column-header-In-Progress")).toHaveText(
      "In-Progress",
    );
    await expect(page.getByTestId("column-header-Done")).toHaveText("Done");
  });

  test("renders the add-task bar with all controls", async ({ page }) => {
    await expect(page.getByTestId("task-title-input")).toBeVisible();
    await expect(page.getByTestId("priority-select")).toBeVisible();
    await expect(page.getByTestId("category-select")).toBeVisible();
    await expect(page.getByTestId("add-task-btn")).toBeVisible();
  });

  test("dropping a task onto its own column leaves it unchanged", async ({
    page,
  }) => {
    const title = `DnD-SameCol-${Date.now()}`;
    await addTask(page, { title });

    const cardTestId = await getCardTestId(page, title);
    await dragCardToColumn(page, cardTestId, "column-Todo");

    const todoCol = page.getByTestId("column-Todo");
    await expect(todoCol.filter({ hasText: title })).toBeVisible();
    await expect(
      page.getByTestId("column-In-Progress").filter({ hasText: title }),
    ).not.toBeVisible();
    await expect(
      page.getByTestId("column-Done").filter({ hasText: title }),
    ).not.toBeVisible();
  });
});
