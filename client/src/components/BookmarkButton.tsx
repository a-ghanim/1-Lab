import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Bookmark as BookmarkType } from "@shared/schema";

interface BookmarkButtonProps {
  moduleId: string;
  courseId: string;
  moduleTitle: string;
  courseTitle: string;
}

export function BookmarkButton({ moduleId, courseId, moduleTitle, courseTitle }: BookmarkButtonProps) {
  const queryClient = useQueryClient();

  const { data: bookmarks = [] } = useQuery<BookmarkType[]>({
    queryKey: ["/api/bookmarks"],
    queryFn: async () => {
      const res = await fetch("/api/bookmarks", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const isBookmarked = bookmarks.some((b) => b.moduleId === moduleId);

  const addBookmark = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ moduleId, courseId }),
      });
      if (!res.ok) throw new Error("Failed to add bookmark");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
    },
  });

  const removeBookmark = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/bookmarks/${moduleId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to remove bookmark");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
    },
  });

  const handleToggle = () => {
    if (isBookmarked) {
      removeBookmark.mutate();
    } else {
      addBookmark.mutate();
    }
  };

  const isPending = addBookmark.isPending || removeBookmark.isPending;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isPending}
      className="h-8 w-8"
      data-testid="button-bookmark"
      title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      {isBookmarked ? (
        <BookmarkCheck className="w-4 h-4 text-primary" strokeWidth={1.5} />
      ) : (
        <Bookmark className="w-4 h-4" strokeWidth={1.5} />
      )}
    </Button>
  );
}
