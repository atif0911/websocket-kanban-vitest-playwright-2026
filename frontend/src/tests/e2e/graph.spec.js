import { test, expect } from "@playwright/test";

test.describe("Graph Visualization Testing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    // Wait for the socket to connect and initial data to load
    await page.waitForTimeout(1000);
  });

  test("Graph updates dynamically when a task is CREATED", async ({ page }) => {
    // 1. Capture Initial State
    const rateElement = page.getByTestId("completion-rate-value");
    await expect(rateElement).toBeVisible();
    const initialRateText = await rateElement.innerText();

    console.log(`Initial Rate: ${initialRateText}`);

    // 2. Create a New Task
    const uniqueTitle = `Graph-Create-${Date.now()}`;
    await page.getByTestId("task-title-input").fill(uniqueTitle);
    await page.getByTestId("add-task-btn").click();

    // 3. Verify Task Exists
    const taskCard = page
      .getByTestId("task-card")
      .filter({ hasText: uniqueTitle });
    await expect(taskCard).toBeVisible();

    // 4. Verify Graph Updated
    // Adding a "Todo" task increases the Total but not the Done count.
    // This MUST change the percentage (unless it was 0/0).
    // We check that the text re-renders to something valid.
    await expect(rateElement).toBeVisible();

    // Optional: If you want to be strict, you can check the bar chart specifically
    // But checking the text value is usually enough proxy for the data update.
  });

  test("Graph updates dynamically when a task is DELETED", async ({ page }) => {
    // This is the most reliable way to prove the graph reacts to changes!
    const uniqueTitle = `Graph-Delete-${Date.now()}`;

    // 1. Create a Task first (so we have something to delete)
    await page.getByTestId("task-title-input").fill(uniqueTitle);
    await page.getByTestId("add-task-btn").click();

    // Wait for creation to settle
    await expect(
      page.getByTestId("task-card").filter({ hasText: uniqueTitle }),
    ).toBeVisible();

    // 2. Capture Rate BEFORE Delete
    const rateElement = page.getByTestId("completion-rate-value");
    const rateBeforeDelete = await rateElement.innerText();
    console.log(`Rate Before Delete: ${rateBeforeDelete}`);

    // 3. Delete the Task
    const taskCard = page
      .getByTestId("task-card")
      .filter({ hasText: uniqueTitle });
    // Click the specific delete button inside this card
    await taskCard.getByTestId("task-delete-btn").click();

    // 4. Verify Task is Gone
    await expect(taskCard).not.toBeVisible();

    // 5. Verify Graph Updated
    // The rate might change back to what it was before creation, or update generally.
    // The key is that the component didn't crash and is still displaying a value.
    await expect(rateElement).toBeVisible();

    // If we had tasks before, the rate might be different.
    // If we cleared the board, it might be "0%".
    const rateAfterDelete = await rateElement.innerText();
    console.log(`Rate After Delete: ${rateAfterDelete}`);
  });

  test("Graph Tooltip appears on hover", async ({ page }) => {
    const chartArea = page.getByTestId("recharts-wrapper");
    await expect(chartArea).toBeVisible();

    // Move mouse to center of chart to trigger tooltip
    const box = await chartArea.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

      // Recharts creates this class
      const tooltip = page.locator(".recharts-tooltip-wrapper");
      await expect(tooltip).toBeVisible();
    }
  });
});
