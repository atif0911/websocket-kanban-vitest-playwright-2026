import { test, expect } from "@playwright/test";

test.describe("File Upload Testing", () => {
  test.beforeEach(async ({ page }) => {
    // 1. Mock the API Upload to return a URL that looks like a valid image
    // This satisfies your Component's Regex check (ends in .png)
    await page.route("**/api/upload", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          fileUrl: "http://localhost:3000/fake-image.png",
        }),
      });
    });

    // 2. Mock the Image Request itself
    // When the browser tries to load "fake-image.png", we serve a real tiny red dot.
    await page.route("**/fake-image.png", async (route) => {
      const buffer = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "base64",
      );
      await route.fulfill({
        status: 200,
        contentType: "image/png",
        body: buffer,
      });
    });

    await page.goto("http://localhost:3000");
    await page.waitForTimeout(500);
  });

  test("User can upload a valid image and see it displayed", async ({
    page,
  }) => {
    const uniqueTitle = `Upload-Img-${Date.now()}`;

    // 1. Create Task
    await page.getByTestId("task-title-input").fill(uniqueTitle);
    await page.getByTestId("add-task-btn").click();

    // 2. Open Edit
    const taskCard = page
      .getByTestId("task-card")
      .filter({ hasText: uniqueTitle });
    await taskCard.getByTestId("task-edit-btn").click();

    // 3. Upload File
    const buffer = Buffer.from("fake image bytes");
    await page.getByTestId("file-input").setInputFiles({
      name: "test.png",
      mimeType: "image/png",
      buffer: buffer,
    });

    // 4. Save
    await page.getByTestId("save-edit-btn").click();
    await expect(page.getByTestId("edit-modal-content")).not.toBeVisible();

    // 5. Verify Image is Visible
    const uploadedImg = taskCard.getByTestId("task-img");

    // Check that the source matches our fake URL
    await expect(uploadedImg).toHaveAttribute(
      "src",
      "http://localhost:3000/fake-image.png",
    );
    // Check that it is actually visible (meaning it loaded successfully)
    await expect(uploadedImg).toBeVisible();
  });

  test("User can upload a PDF and see a link", async ({ page }) => {
    const uniqueTitle = `Upload-Doc-${Date.now()}`;

    // Override route just for this test to return a PDF link
    // We don't need to mock the PDF download request, just the API response
    await page.route("**/api/upload", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ fileUrl: "https://example.com/document.pdf" }),
      });
    });

    await page.getByTestId("task-title-input").fill(uniqueTitle);
    await page.getByTestId("add-task-btn").click();

    const taskCard = page
      .getByTestId("task-card")
      .filter({ hasText: uniqueTitle });
    await taskCard.getByTestId("task-edit-btn").click();

    const buffer = Buffer.from("fake pdf content");
    await page.getByTestId("file-input").setInputFiles({
      name: "document.pdf",
      mimeType: "application/pdf",
      buffer: buffer,
    });

    await page.getByTestId("save-edit-btn").click();

    const fileLink = taskCard.getByTestId("task-file-link");
    await expect(fileLink).toBeVisible();
    await expect(fileLink).toHaveAttribute(
      "href",
      "https://example.com/document.pdf",
    );
  });

  test("Invalid files (too large) show an error message", async ({ page }) => {
    const uniqueTitle = `Upload-Large-${Date.now()}`;

    await page.getByTestId("task-title-input").fill(uniqueTitle);
    await page.getByTestId("add-task-btn").click();

    const taskCard = page
      .getByTestId("task-card")
      .filter({ hasText: uniqueTitle });
    await taskCard.getByTestId("task-edit-btn").click();

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toContain("File is too large");
      await dialog.accept();
    });

    const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
    await page.getByTestId("file-input").setInputFiles({
      name: "huge.png",
      mimeType: "image/png",
      buffer: largeBuffer,
    });

    const inputValue = await page.getByTestId("file-input").inputValue();
    expect(inputValue).toBe("");
  });
});

