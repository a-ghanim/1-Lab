import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit2, Plus, Check, X, Loader2 } from "lucide-react";
import type { Note } from "@shared/schema";

interface NotesPanelProps {
  moduleId: string;
  courseId: string;
}

export function NotesPanel({ moduleId, courseId }: NotesPanelProps) {
  const queryClient = useQueryClient();
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ["/api/notes", moduleId],
    queryFn: async () => {
      const res = await fetch(`/api/notes/${moduleId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!moduleId,
  });

  const createNote = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ moduleId, courseId, content }),
      });
      if (!res.ok) throw new Error("Failed to create note");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes", moduleId] });
      setNewNoteContent("");
    },
  });

  const updateNote = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to update note");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes", moduleId] });
      setEditingNoteId(null);
      setEditingContent("");
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete note");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes", moduleId] });
    },
  });

  const handleAutoSave = useCallback((content: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      if (content.trim()) {
        createNote.mutate(content);
      }
    }, 1500);
  }, [createNote]);

  const handleNewNoteChange = (value: string) => {
    setNewNoteContent(value);
    if (value.trim()) {
      handleAutoSave(value);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setNewNoteContent("");
    setEditingNoteId(null);
    setEditingContent("");
  }, [moduleId]);

  const handleAddNote = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (newNoteContent.trim()) {
      createNote.mutate(newNoteContent);
    }
  };

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingContent("");
  };

  const handleSaveEdit = (id: string) => {
    if (editingContent.trim()) {
      updateNote.mutate({ id, content: editingContent });
    }
  };

  const formatTimestamp = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full" data-testid="notes-panel">
      <div className="px-4 py-3 border-b border-border">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Notes
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-2">
          <Textarea
            value={newNoteContent}
            onChange={(e) => handleNewNoteChange(e.target.value)}
            placeholder="Add a note..."
            className="min-h-[80px] resize-none text-sm"
            data-testid="input-new-note"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleAddNote}
              size="sm"
              disabled={!newNoteContent.trim() || createNote.isPending}
              className="gap-1"
              data-testid="button-add-note"
            >
              {createNote.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Plus className="w-3 h-3" strokeWidth={2} />
              )}
              Add
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No notes yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-3 border border-border bg-card/50 rounded-md"
                data-testid={`note-item-${note.id}`}
              >
                {editingNoteId === note.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="min-h-[60px] resize-none text-sm"
                      data-testid={`input-edit-note-${note.id}`}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={handleCancelEdit}
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        data-testid={`button-cancel-edit-${note.id}`}
                      >
                        <X className="w-3 h-3" strokeWidth={2} />
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleSaveEdit(note.id)}
                        size="sm"
                        disabled={!editingContent.trim() || updateNote.isPending}
                        className="gap-1"
                        data-testid={`button-save-edit-${note.id}`}
                      >
                        {updateNote.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" strokeWidth={2} />
                        )}
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap" data-testid={`text-note-content-${note.id}`}>
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                      <span className="text-xs text-muted-foreground" data-testid={`text-note-timestamp-${note.id}`}>
                        {formatTimestamp(note.updatedAt || note.createdAt)}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => handleStartEdit(note)}
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          data-testid={`button-edit-note-${note.id}`}
                        >
                          <Edit2 className="w-3 h-3" strokeWidth={2} />
                        </Button>
                        <Button
                          onClick={() => deleteNote.mutate(note.id)}
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          disabled={deleteNote.isPending}
                          data-testid={`button-delete-note-${note.id}`}
                        >
                          {deleteNote.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" strokeWidth={2} />
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
