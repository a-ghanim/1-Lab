import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  FileText, 
  Link as LinkIcon, 
  Trash2, 
  Loader2,
  FileUp,
  X,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Source {
  id: string;
  type: "text" | "url" | "file";
  title: string;
  content?: string;
  url?: string;
  createdAt: string;
}

interface SourcesPanelProps {
  notebookId: string;
}

export function SourcesPanel({ notebookId }: SourcesPanelProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<"text" | "url">("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  
  const queryClient = useQueryClient();

  const { data: sources = [], isLoading } = useQuery<Source[]>({
    queryKey: ["/api/sources", notebookId],
    queryFn: async () => {
      const res = await fetch(`/api/sources/${notebookId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!notebookId,
  });

  const addSource = useMutation({
    mutationFn: async (data: { type: string; title: string; content?: string; url?: string }) => {
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notebookId, ...data }),
      });
      if (!res.ok) throw new Error("Failed to add source");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sources", notebookId] });
      setShowAddModal(false);
      setTitle("");
      setContent("");
      setUrl("");
    },
  });

  const deleteSource = useMutation({
    mutationFn: async (sourceId: string) => {
      const res = await fetch(`/api/sources/${sourceId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete source");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sources", notebookId] });
    },
  });

  const handleAddSource = () => {
    if (!title.trim()) return;
    
    if (addType === "url") {
      addSource.mutate({ type: "url", title, url });
    } else {
      addSource.mutate({ type: "text", title, content });
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "url": return LinkIcon;
      case "file": return FileUp;
      default: return FileText;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <span className="font-medium text-sm">Sources</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="text-accent hover:text-accent"
          data-testid="button-add-source"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : sources.length === 0 ? (
          <div className="text-center py-8">
            <div className="p-3 rounded-full bg-muted/50 w-fit mx-auto mb-3">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No sources yet</p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              Add documents, text, or URLs
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <AnimatePresence>
              {sources.map((source) => {
                const Icon = getSourceIcon(source.type);
                return (
                  <motion.div
                    key={source.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate flex-1">{source.title}</span>
                    <button
                      onClick={() => deleteSource.mutate(source.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                      data-testid={`button-delete-source-${source.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add Source</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setAddType("text")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                    addType === "text"
                      ? "bg-accent/10 border-accent text-accent"
                      : "bg-muted/30 border-border/50 text-muted-foreground hover:border-border"
                  }`}
                  data-testid="button-source-type-text"
                >
                  <FileText className="w-4 h-4" />
                  Text
                </button>
                <button
                  onClick={() => setAddType("url")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                    addType === "url"
                      ? "bg-accent/10 border-accent text-accent"
                      : "bg-muted/30 border-border/50 text-muted-foreground hover:border-border"
                  }`}
                  data-testid="button-source-type-url"
                >
                  <LinkIcon className="w-4 h-4" />
                  URL
                </button>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Source title"
                  className="w-full px-4 py-2.5 bg-muted border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  data-testid="input-source-title"
                />
                
                {addType === "url" ? (
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/article"
                    className="w-full px-4 py-2.5 bg-muted border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    data-testid="input-source-url"
                  />
                ) : (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your text content here..."
                    rows={6}
                    className="w-full px-4 py-2.5 bg-muted border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                    data-testid="input-source-content"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddSource}
                  disabled={!title.trim() || addSource.isPending}
                  className="gap-2"
                  data-testid="button-confirm-add-source"
                >
                  {addSource.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Add Source
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
