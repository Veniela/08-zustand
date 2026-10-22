
"use client";

import { useActionState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import css from "./NoteForm.module.css";
import { createNote } from "@/lib/api";
import type { NoteTag } from "@/types/note";
import { useNoteStore } from "@/lib/store/noteStore";

type FormState = {
  error: string;
};

const initialState: FormState = {
  error: "",
};

export default function NoteForm() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const draft = useNoteStore((state) => state.draft);
  const setDraft = useNoteStore((state) => state.setDraft);
  const clearDraft = useNoteStore((state) => state.clearDraft);

  async function handleFormAction(
    _prevState: FormState,
    formData: FormData
  ): Promise<FormState> {
    const title = String(formData.get("title") ?? "");
    const content = String(formData.get("content") ?? "");
    const tag = String(formData.get("tag") ?? "Todo") as NoteTag;

    try {
      await createNote({ title, content, tag });

      clearDraft();
      await queryClient.invalidateQueries({ queryKey: ["notes"] });

      toast.success("Note created successfully!");
      router.push("/notes/filter/all");

      return initialState;
    } catch {
      toast.error("Failed to create note. Please try again.");

      return {
        error: "Failed to create note. Please try again.",
      };
    }
  }

  const [state, formAction, isPending] = useActionState(
    handleFormAction,
    initialState
  );

  return (
    <form action={formAction} className={css.form}>
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          className={css.input}
          defaultValue={draft.title}
          onChange={(event) =>
            setDraft({ title: event.target.value })
          }
          minLength={3}
          maxLength={50}
          required
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          rows={8}
          className={css.textarea}
          defaultValue={draft.content}
          onChange={(event) =>
            setDraft({ content: event.target.value })
          }
          maxLength={500}
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>
        <select
          id="tag"
          name="tag"
          className={css.select}
          defaultValue={draft.tag}
          onChange={(event) =>
            setDraft({ tag: event.target.value as NoteTag })
          }
          required
        >
          <option value="Todo">Todo</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Meeting">Meeting</option>
          <option value="Shopping">Shopping</option>
        </select>
      </div>

      {state.error && (
        <p role="alert" className={css.error}>
          {state.error}
        </p>
      )}

      <div className={css.actions}>
        <button
          type="button"
          className={css.cancelButton}
          onClick={() => router.back()}
        >
          Cancel
        </button>

        <button
          type="submit"
          className={css.submitButton}
          disabled={!draft.title.trim() || isPending}
        >
          {isPending ? "Creating..." : "Create note"}
        </button>
      </div>
    </form>
  );
}
