import dayjs from "dayjs";
import { usePersistentState } from "@/hooks/usePersistentState";
import { defaultTodos } from "./data";
import type { Todo } from "./types";

export function useTodos() {
  // Key "todos" → localStorage "lifeos:todos" (hook adds the prefix)
  const [todos, setTodos] = usePersistentState<Todo[]>("todos", defaultTodos);

  const addTodo = (payload: Omit<Todo, "id" | "createdAt" | "done">) => {
    setTodos((list) => [
      {
        ...payload,
        id: Date.now(),
        done: false,
        createdAt: dayjs().toISOString(),
      },
      ...list,
    ]);
  };

  const updateTodo = (id: number, patch: Partial<Todo>) => {
    setTodos((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const deleteTodo = (id: number) => {
    setTodos((list) => list.filter((t) => t.id !== id));
  };

  const toggleTodo = (id: number) => {
    setTodos((list) =>
      list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  };

  return { todos, addTodo, updateTodo, deleteTodo, toggleTodo };
}
