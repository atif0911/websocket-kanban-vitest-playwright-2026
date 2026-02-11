import { describe, it, expect } from "vitest";
import { getPriorityColor, getCategoryColor } from "../../utils";

describe("Utility Functions", () => {
  describe("getPriorityColor", () => {
    it("returns red-ish color for high priority", () => {
      const color = getPriorityColor("High");
      expect(color).toBe("#ffadad");
    });
    it("returns orange-ish color for medium priority", () => {
      const color = getPriorityColor("Medium");
      expect(color).toBe("#ffd6a5");
    });
    it("returns green-ish color for low priority", () => {
      const color = getPriorityColor("Low");
      expect(color).toBe("#caffbf");
    });
    it("returns grey color for unknown priority", () => {
      const color = getPriorityColor("Unknown");
      expect(color).toBe("#e0e0e0");
    });
  });

  describe("getCategoryColor", () => {
    it("returns red for Bug", () => {
      expect(getCategoryColor("Bug")).toBe("red");
    });
    it("returns blue for Feature", () => {
      expect(getCategoryColor("Feature")).toBe("blue");
    });
    it("returns green for Enhancement", () => {
      expect(getCategoryColor("Enhancement")).toBe("green");
    });
    it("returns grey for Unknown", () => {
      expect(getCategoryColor("Unknown")).toBe("grey");
    });
  });
});
