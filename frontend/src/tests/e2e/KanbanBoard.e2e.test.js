import { test, expect } from "@playwright/test";

test("User can add a task and see it on the board", async ({ page }) => {
  //base url from config
  await page.goto("/");
  const uniqueTaskName = `Task ${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  //browser connected to the server
  await expect(page.getByText("Connected")).toBeVisible();

  //enter task title
  await page.getByPlaceholder("Enter task title...").fill(uniqueTaskName);

  //dropdown medium to high
  await page.locator("select").first().selectOption("High");

  //add button
  await page.getByRole("button", { name: "Add Task" }).click();

  //it should appear in the todo
  await expect(page.getByText(uniqueTaskName)).toBeVisible();

  //check for high in card
  await expect(
    page.locator(".task-card").filter({ hasText: uniqueTaskName }).first(),
  ).toContainText("High");
});
