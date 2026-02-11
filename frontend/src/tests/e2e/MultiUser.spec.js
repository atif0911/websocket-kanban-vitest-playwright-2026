import { test, expect } from "@playwright/test";

test("Real-time sync between two users", async ({ browser }) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  await pageA.goto("/");
  await pageB.goto("/");

  // create a task
  const uniqueTaskName = `Sync Task ${Date.now()}`;
  await pageA.getByPlaceholder("Enter task title...").fill(uniqueTaskName);
  await pageA.getByRole("button", { name: "Add Task" }).click();

  // wait for B to receive it
  await expect(pageB.getByText(uniqueTaskName)).toBeVisible();

  // Locate the card on User B's screen
  const taskCard = pageB
    .locator(".task-card")
    .filter({ hasText: uniqueTaskName });

  // focus the card
  await taskCard.focus();

  // lift the card
  await pageB.keyboard.press("Space");
  await pageB.waitForTimeout(200); // Allow animation to start

  // move to "In Progress"
  await pageB.keyboard.press("ArrowRight");
  await pageB.waitForTimeout(200);

  // move to "Done"
  await pageB.keyboard.press("ArrowRight");
  await pageB.waitForTimeout(200);

  // drop the card
  await pageB.keyboard.press("Space");
  await pageB.waitForTimeout(500); // Allow socket to sync

  // verify: User A sees the move
  const doneColumnA = pageA.locator(".column").filter({ hasText: "done" });

  await expect(
    doneColumnA.locator(".task-card").filter({ hasText: uniqueTaskName }),
  ).toBeVisible({ timeout: 10000 });

  // cleanup
  await pageA
    .locator(".task-card")
    .filter({ hasText: uniqueTaskName })
    .getByRole("button", { name: "✖" })
    .click();
  await expect(pageB.getByText(uniqueTaskName)).not.toBeVisible();
});
