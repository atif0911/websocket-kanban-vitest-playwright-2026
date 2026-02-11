import { test, expect } from "@playwright/test";

test.describe("Kanban Board Core Features", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    // Wait for socket connection
    await page.waitForTimeout(1000);
  });

  test("User can create and delete a task", async ({ page }) => {
    const uniqueTitle = `Task-CRUD-${Date.now()}`;

    // 1. Create Task
    await page.getByTestId("task-title-input").fill(uniqueTitle);
    await page.getByTestId("priority-select").selectOption("High");
    await page.getByTestId("add-task-btn").click();

    // 2. Verify Task Appears
    // Filter by text to find the specific card
    const taskCard = page
      .getByTestId("task-card")
      .filter({ hasText: uniqueTitle });
    await expect(taskCard).toBeVisible();
    await expect(taskCard.getByTestId("task-priority")).toHaveText("High");

    // 3. Delete Task
    // Click the delete button inside THIS card
    await taskCard.getByTestId("task-delete-btn").click();

    // 4. Verify Task Removed
    await expect(taskCard).not.toBeVisible();
  });

  test("Real-time: UI updates when another user modifies tasks", async ({
    browser,
  }) => {
    // Create two independent browser contexts (User A and User B)
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // Both users go to the app
    await pageA.goto("http://localhost:3000");
    await pageB.goto("http://localhost:3000");
    await pageA.waitForTimeout(500);

    const uniqueTitle = `Realtime-Task-${Date.now()}`;

    // --- SCENARIO 1: User A Creates, User B Sees it ---

    // User A adds task
    await pageA.getByTestId("task-title-input").fill(uniqueTitle);
    await pageA.getByTestId("add-task-btn").click();

    // User B should see it instantly (without refreshing)
    const cardB = pageB
      .getByTestId("task-card")
      .filter({ hasText: uniqueTitle });
    await expect(cardB).toBeVisible();

    // --- SCENARIO 2: User A Edits, User B Sees update ---

    // User A edits the task
    const cardA = pageA
      .getByTestId("task-card")
      .filter({ hasText: uniqueTitle });
    await cardA.getByTestId("task-edit-btn").click();

    const newTitle = uniqueTitle + " (Edited)";
    await pageA.getByTestId("edit-title-input").fill(newTitle);
    await pageA.getByTestId("save-edit-btn").click();

    // User B should see the NEW title instantly
    const cardB_Updated = pageB
      .getByTestId("task-card")
      .filter({ hasText: newTitle });
    await expect(cardB_Updated).toBeVisible();

    // --- SCENARIO 3: User B Deletes, User A Sees removal ---

    // User B deletes the task
    await cardB_Updated.getByTestId("task-delete-btn").click();

    // User A should see it disappear
    await expect(cardA).not.toBeVisible();

    // Cleanup
    await contextA.close();
    await contextB.close();
  });
});
