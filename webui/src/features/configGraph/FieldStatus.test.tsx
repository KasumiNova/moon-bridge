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
});
