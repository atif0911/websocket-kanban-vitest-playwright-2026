import { test, expect } from "@playwright/test";

test.describe("Kanban Drag and Drop", () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.waitForTimeout(2000); // Extra wait for app to settle
  });

  async function dragTaskSlowly(page, taskTitle, headerTestId) {
    const taskCard = page
      .getByTestId("task-card")
      .filter({ hasText: taskTitle })
      .first();
    const targetHeader = page.getByTestId(headerTestId);

    // 1. Hover over the task
    await taskCard.hover();

    // 2. Mouse Down (Click and Hold)
    const taskBox = await taskCard.boundingBox();
    await page.mouse.move(
      taskBox.x + taskBox.width / 2,
      taskBox.y + taskBox.height / 2,
    );
    await page.mouse.down();

    // 3. "Wake up" the drag (Move 10px down)
    // We wait longer here to let the "Lift" animation finish
    await page.mouse.move(
      taskBox.x + taskBox.width / 2,
      taskBox.y + taskBox.height / 2 + 10,
    );
    await page.waitForTimeout(500);

    // 4. Move to the TARGET HEADER (Very Slowly)
    const targetBox = await targetHeader.boundingBox();

    await page.mouse.move(
      targetBox.x + targetBox.width / 2,
      targetBox.y + targetBox.height / 2,
      { steps: 150 }, // INCREASED: 150 steps makes it look like a slow human hand
    );

    // 5. Hover over target for a full second
    // This forces the "Drop Placeholder" to appear
    await page.waitForTimeout(1000);

    // 6. Release
    await page.mouse.up();
    await page.waitForTimeout(2000); // Wait for socket sync
  }

  test("User can drag a task from Todo to In-Progress (Slowly)", async ({
    page,
  }) => {
    const uniqueTitle = `Slow-Drag-${Date.now()}`;

    // 1. Create Task
    await page.getByTestId("task-title-input").fill(uniqueTitle);
    await page.getByTestId("add-task-btn").click();

    // 2. Locate "In-Progress" text to aim for
    // If you haven't added the specific ID yet, we target the text
    const targetHeader = page.locator("h3", { hasText: "In-Progress" });

    // 3. Perform Slow Drag
    // We pass the locator ID if you added it, otherwise we can adjust the helper
    // Assuming you added data-testid="column-header-In-Progress"
    await dragTaskSlowly(page, uniqueTitle, "column-header-In-Progress");

    // 4. Verify
    const inProgressColumn = page.getByTestId("column-In-Progress");
    await expect(inProgressColumn).toContainText(uniqueTitle);
  });
});
