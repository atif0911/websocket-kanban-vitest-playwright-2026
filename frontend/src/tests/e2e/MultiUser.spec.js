import { test, expect } from "@playwright/test";

test("Real-time sync between two users", async ({ browser }) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  await pageA.goto("/");
  await pageB.goto("/");

  // 1. Setup: Create a task
  const uniqueTaskName = `Sync Task ${Date.now()}`;
  await pageA.getByPlaceholder("Enter task title...").fill(uniqueTaskName);
  await pageA.getByRole("button", { name: "Add Task" }).click();

  // Wait for B to receive it
  await expect(pageB.getByText(uniqueTaskName)).toBeVisible();

  // 2. THE KEYBOARD MOVE (100% Reliable)
  // Locate the card on User B's screen
  const taskCard = pageB
    .locator(".task-card")
    .filter({ hasText: uniqueTaskName });

  // A. Focus the card
  await taskCard.focus();

  // B. Lift the card
  await pageB.keyboard.press("Space");
  await pageB.waitForTimeout(200); // Allow animation to start

  // C. Move to "In Progress"
  await pageB.keyboard.press("ArrowRight");
  await pageB.waitForTimeout(200);

  // D. Move to "Done"
  await pageB.keyboard.press("ArrowRight");
  await pageB.waitForTimeout(200);

  // E. Drop the card
  await pageB.keyboard.press("Space");
  await pageB.waitForTimeout(500); // Allow socket to sync

  // 3. VERIFY: User A sees the move
  const doneColumnA = pageA.locator(".column").filter({ hasText: "done" });

  await expect(
    doneColumnA.locator(".task-card").filter({ hasText: uniqueTaskName }),
  ).toBeVisible({ timeout: 10000 });

  // 4. Cleanup
  await pageA
    .locator(".task-card")
    .filter({ hasText: uniqueTaskName })
    .getByRole("button", { name: "✖" })
    .click();
  await expect(pageB.getByText(uniqueTaskName)).not.toBeVisible();
});
