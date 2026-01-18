import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Bookmark, BookOpen, Trash2, ArrowRight, Loader2 } from "lucide-react";
import type { Bookmark as BookmarkType, Module, Course } from "@shared/schema";

interface BookmarkWithDetails extends BookmarkType {
  module?: Module;
  course?: Course;
}

export default function Bookmarks() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: bookmarks = [], isLoading } = useQuery<BookmarkType[]>({
    queryKey: ["/api/bookmarks"],
    queryFn: async () => {
      const res = await fetch("/api/bookmarks", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: bookmarksWithDetails = [] } = useQuery<BookmarkWithDetails[]>({
    queryKey: ["/api/bookmarks/details", bookmarks],
    queryFn: async () => {
      const details = await Promise.all(
        bookmarks.map(async (bookmark) => {
          const [moduleRes, courseRes] = await Promise.all([
            fetch(`/api/modules/${bookmark.moduleId}`, { credentials: "include" }),
            fetch(`/api/courses/${bookmark.courseId}`, { credentials: "include" }),
          ]);
          
          const module = moduleRes.ok ? await moduleRes.json() : undefined;
          const course = courseRes.ok ? await courseRes.json() : undefined;
          
          return { ...bookmark, module, course };
        })
      );
      return details;
    },
    enabled: bookmarks.length > 0,
  });

  const removeBookmark = useMutation({
    mutationFn: async (moduleId: string) => {
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

  const handleNavigate = (courseId: string, moduleOrder: number) => {
    navigate(`/courses/${courseId}?module=${moduleOrder - 1}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Bookmark className="w-6 h-6" strokeWidth={1.5} />
          <h1 className="text-2xl font-medium">Bookmarks</h1>
        </div>

        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Bookmark className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-medium mb-2">No bookmarks yet</h2>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              Bookmark modules while studying to save them for quick access later.
            </p>
            <Button onClick={() => navigate("/dashboard")} variant="outline">
              <BookOpen className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Browse Courses
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarksWithDetails.map((bookmark) => (
              <div
                key={bookmark.id}
                className="flex items-center gap-4 p-4 bg-card border border-border hover:border-foreground/20 transition-colors group"
                data-testid={`bookmark-item-${bookmark.id}`}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">
                    {bookmark.module?.title || "Module"}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {bookmark.course?.title || "Course"}
                  </p>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBookmark.mutate(bookmark.moduleId)}
                    disabled={removeBookmark.isPending}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    data-testid={`button-remove-bookmark-${bookmark.id}`}
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleNavigate(bookmark.courseId, bookmark.module?.order || 1)}
                    className="h-8 w-8"
                    data-testid={`button-goto-bookmark-${bookmark.id}`}
                  >
                    <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
