import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { FieldStatus } from "./FieldStatus";

describe("FieldStatus", () => {
  test("renders compact save state labels", () => {
    const { rerender } = render(<FieldStatus status="saving" />);

    expect(screen.getByText("Saving")).toBeInTheDocument();

    rerender(<FieldStatus status="error" message="invalid value" />);

    expect(screen.getByText("invalid value")).toBeInTheDocument();
  });

  test("exposes status metadata for icon-ready styling", () => {
    render(<FieldStatus status="dirty" />);

    expect(screen.getByRole("status")).toHaveAttribute("data-status", "dirty");
    expect(screen.getByRole("status").querySelector(".field-status__dot")).toBeInTheDocument();
  });
});
