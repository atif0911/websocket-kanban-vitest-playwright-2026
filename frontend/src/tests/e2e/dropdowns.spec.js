import { test, expect } from "@playwright/test";

test.describe("Dropdown Select Testing (Priority & Category)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    // Ensure socket connection is ready
    await page.waitForTimeout(500);
  });

  test("User can create a task with specific Priority and Category", async ({
    page,
  }) => {
    const uniqueTitle = `Dropdown-Create-${Date.now()}`;

    // 1. Fill out the "Add Task" form
    await page.getByTestId("task-title-input").fill(uniqueTitle);

    // Select "High" Priority
    await page.getByTestId("priority-select").selectOption("High");

    // Select "Bug" Category
    await page.getByTestId("category-select").selectOption("Bug");

    // Click Add
    await page.getByTestId("add-task-btn").click();

    // 2. Locate the specific card
    // We filter by text to ensure we grab the one we just made
    const taskCard = page
      .getByTestId("task-card")
      .filter({ hasText: uniqueTitle })
      .first();

    // 3. Verify the Badge and Footer reflect the dropdown choices
    await expect(taskCard).toBeVisible();

    // Verify Priority Badge (using the new ID we added)
    await expect(taskCard.getByTestId("task-priority")).toHaveText("High");

    // Verify Category Footer (using the new ID we added)
    await expect(taskCard.getByTestId("task-category")).toHaveText("Bug");
  });

  test("User can edit a task to change Priority and Category", async ({
    page,
  }) => {
    const uniqueTitle = `Dropdown-Edit-${Date.now()}`;

    // 1. Create a default task (Medium / Feature)
    await page.getByTestId("task-title-input").fill(uniqueTitle);
    await page.getByTestId("add-task-btn").click();

    // 2. Locate the card and click Edit
    const taskCard = page
      .getByTestId("task-card")
      .filter({ hasText: uniqueTitle })
      .first();
    await taskCard.getByTestId("task-edit-btn").click();

    // 3. Wait for Modal and Change Dropdowns
    const modal = page.getByTestId("edit-modal-content");
    await expect(modal).toBeVisible();

    // Change Priority to "Low"
    await page.getByTestId("edit-priority-select").selectOption("Low");

    // Change Category to "Enhancement"
    await page.getByTestId("edit-category-select").selectOption("Enhancement");

    // Save
    await page.getByTestId("save-edit-btn").click();

    // 4. Verify updates reflect on the card
    // Note: The card instance might re-render, so strictly speaking locators auto-recover,
    // but checking the locator again is safe.
    await expect(taskCard.getByTestId("task-priority")).toHaveText("Low");
    await expect(taskCard.getByTestId("task-category")).toHaveText(
      "Enhancement",
    );
  });
});
