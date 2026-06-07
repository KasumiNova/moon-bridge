import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import type { PatchResponse } from "../../rpc/types";
import { useAutosaveField, type SaveField } from "./useAutosaveField";

const committed = (revision = "rev-2"): PatchResponse => ({
  result: "committed",
  revision
});

describe("useAutosaveField", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("marks the field dirty as soon as local value changes", () => {
    vi.useFakeTimers();
    const save: SaveField<string> = vi.fn();
    const { result } = renderHook(() =>
      useAutosaveField({
        resourceKind: "defaults",
        resourceId: "main",
        field: "model",
        committedValue: "claude-3-5-sonnet",
        revision: "rev-1",
        save,
        debounceMs: 50
      })
    );

    act(() => result.current.setValue("claude-3-7-sonnet"));

    expect(result.current.value).toBe("claude-3-7-sonnet");
    expect(result.current.status).toBe("dirty");
    expect(save).not.toHaveBeenCalled();
  });

  test("debounces saving and clears dirty state after commit", async () => {
    vi.useFakeTimers();
    const save: SaveField<string> = vi.fn().mockResolvedValue(committed());
    const { result } = renderHook(() =>
      useAutosaveField({
        resourceKind: "defaults",
        resourceId: "main",
        field: "model",
        committedValue: "old-model",
        revision: "rev-1",
        save,
        debounceMs: 50
      })
    );

    act(() => result.current.setValue("new-model"));
    act(() => vi.advanceTimersByTime(49));
    expect(save).not.toHaveBeenCalled();

    await advanceTimersAndFlush(1);
    expect(save).toHaveBeenCalledWith({
      baseRevision: "rev-1",
      change: {
        kind: "defaults",
        id: "main",
        field: "model",
        value: "new-model"
      }
    });
    expect(result.current.status).toBe("saved");
    expect(result.current.error).toBeUndefined();
  });

  test("keeps draft value and field error after draft rejection", async () => {
    vi.useFakeTimers();
    const save: SaveField<number> = vi.fn().mockResolvedValue({
      result: "draftRejected",
      revision: "rev-1",
      errors: [
        {
          resourceKind: "defaults",
          resourceId: "main",
          field: "max_tokens",
          code: "invalidValue",
          message: "must be positive"
        }
      ]
    } satisfies PatchResponse);
    const { result } = renderHook(() =>
      useAutosaveField({
        resourceKind: "defaults",
        resourceId: "main",
        field: "max_tokens",
        committedValue: 1024,
        revision: "rev-1",
        save,
        debounceMs: 1
      })
    );

    act(() => result.current.setValue(-1));
    await advanceTimersAndFlush(1);

    expect(result.current.status).toBe("error");
    expect(result.current.value).toBe(-1);
    expect(result.current.error?.message).toBe("must be positive");
  });

  test("rolls back to the server value after runtime rejection", async () => {
    vi.useFakeTimers();
    const save: SaveField<string> = vi.fn().mockResolvedValue({
      result: "runtimeRejected",
      revision: "rev-2",
      rollbackValue: "old-address",
      errors: [
        {
          resourceKind: "server",
          resourceId: "main",
          field: "addr",
          code: "runtimeReloadRejected",
          message: "address already in use"
        }
      ]
    } satisfies PatchResponse);
    const { result } = renderHook(() =>
      useAutosaveField({
        resourceKind: "server",
        resourceId: "main",
        field: "addr",
        committedValue: "old-address",
        revision: "rev-1",
        save,
        debounceMs: 1
      })
    );

    act(() => result.current.setValue("bad-address"));
    await advanceTimersAndFlush(1);

    expect(result.current.status).toBe("error");
    expect(result.current.value).toBe("old-address");
    expect(result.current.error?.message).toBe("address already in use");
  });
});

async function advanceTimersAndFlush(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
    await Promise.resolve();
    await Promise.resolve();
  });
}
