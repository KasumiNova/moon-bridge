import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from "react";

type ApplyTask = () => Promise<void> | void;

type ApplyDraftContextValue = {
  registerApplyTask: (id: string, task: ApplyTask) => () => void;
  runApplyTasks: () => Promise<void>;
};

const ApplyDraftContext = createContext<ApplyDraftContextValue>({
  registerApplyTask: () => () => undefined,
  runApplyTasks: async () => undefined
});

export function ApplyDraftProvider({ children }: { children: ReactNode }) {
  const tasks = useRef(new Map<string, ApplyTask>());

  const registerApplyTask = useCallback((id: string, task: ApplyTask) => {
    tasks.current.set(id, task);
    return () => {
      if (tasks.current.get(id) === task) {
        tasks.current.delete(id);
      }
    };
  }, []);

  const runApplyTasks = useCallback(async () => {
    for (const task of tasks.current.values()) {
      await task();
    }
  }, []);

  const value = useMemo(
    () => ({ registerApplyTask, runApplyTasks }),
    [registerApplyTask, runApplyTasks]
  );

  return (
    <ApplyDraftContext.Provider value={value}>
      {children}
    </ApplyDraftContext.Provider>
  );
}

export function useApplyDrafts() {
  return useContext(ApplyDraftContext);
}
