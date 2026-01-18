import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { FluidBackground } from "@/components/FluidBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Folder,
  FolderPlus,
  Trash2,
  ArrowLeft,
  BookOpen,
  X,
  Loader2,
  Plus,
} from "lucide-react";
import type { Folder as FolderType, Course } from "@shared/schema";

const FOLDER_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
];

export default function Folders() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0]);
  const [folderToDelete, setFolderToDelete] = useState<FolderType | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<FolderType | null>(null);
  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false);

  const { data: folders = [], isLoading: foldersLoading } = useQuery<FolderType[]>({
    queryKey: ["/api/folders"],
    queryFn: async () => {
      const res = await fetch("/api/folders", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch folders");
      return res.json();
    },
  });

  const { data: allCourses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses", true],
    queryFn: async () => {
      const res = await fetch("/api/courses?includeArchived=true", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch courses");
      return res.json();
    },
  });

  const { data: folderCourses = [], isLoading: folderCoursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/folders", selectedFolder?.id, "courses"],
    queryFn: async () => {
      if (!selectedFolder) return [];
      const res = await fetch(`/api/folders/${selectedFolder.id}/courses`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch folder courses");
      return res.json();
    },
    enabled: !!selectedFolder,
  });

  const { data: folderCourseCounts = {} } = useQuery<Record<string, number>>({
    queryKey: ["/api/folders/counts"],
    queryFn: async () => {
      const counts: Record<string, number> = {};
      for (const folder of folders) {
        const res = await fetch(`/api/folders/${folder.id}/courses`, { credentials: "include" });
        if (res.ok) {
          const courses = await res.json();
          counts[folder.id] = courses.length;
        }
      }
      return counts;
    },
    enabled: folders.length > 0,
  });

  const createFolder = useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, color }),
      });
      if (!res.ok) throw new Error("Failed to create folder");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      setShowCreateDialog(false);
      setNewFolderName("");
      setNewFolderColor(FOLDER_COLORS[0]);
      toast({ description: "Folder created" });
    },
    onError: () => {
      toast({ description: "Failed to create folder", variant: "destructive" });
    },
  });

  const deleteFolder = useMutation({
    mutationFn: async (folderId: string) => {
      const res = await fetch(`/api/folders/${folderId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete folder");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      setFolderToDelete(null);
      if (selectedFolder && folderToDelete?.id === selectedFolder.id) {
        setSelectedFolder(null);
      }
      toast({ description: "Folder deleted" });
    },
    onError: () => {
      toast({ description: "Failed to delete folder", variant: "destructive" });
    },
  });

  const addCourseToFolder = useMutation({
    mutationFn: async ({ courseId, folderId }: { courseId: string; folderId: string }) => {
      const res = await fetch(`/api/folders/${folderId}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ courseId }),
      });
      if (!res.ok) throw new Error("Failed to add course to folder");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/folders", selectedFolder?.id, "courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/folders/counts"] });
      toast({ description: "Course added to folder" });
    },
    onError: () => {
      toast({ description: "Failed to add course", variant: "destructive" });
    },
  });

  const removeCourseFromFolder = useMutation({
    mutationFn: async ({ courseId, folderId }: { courseId: string; folderId: string }) => {
      const res = await fetch(`/api/folders/${folderId}/courses/${courseId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to remove course from folder");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/folders", selectedFolder?.id, "courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/folders/counts"] });
      toast({ description: "Course removed from folder" });
    },
    onError: () => {
      toast({ description: "Failed to remove course", variant: "destructive" });
    },
  });

  const coursesNotInFolder = allCourses.filter(
    (course) => !folderCourses.some((fc) => fc.id === course.id)
  );

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    createFolder.mutate({ name: newFolderName.trim(), color: newFolderColor });
  };

  if (selectedFolder) {
    return (
      <Layout>
        <FluidBackground />
        <div className="min-h-screen relative z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFolder(null)}
                  data-testid="button-back-to-folders"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded"
                    style={{ backgroundColor: selectedFolder.color || "#6366f1" }}
                  />
                  <h1 className="text-xl font-medium">{selectedFolder.name}</h1>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {folderCourses.length} {folderCourses.length === 1 ? "course" : "courses"}
                </p>
                <Button
                  size="sm"
                  onClick={() => setShowAddCourseDialog(true)}
                  data-testid="button-add-course-to-folder"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add course
                </Button>
              </div>

              {folderCoursesLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : folderCourses.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center h-64 border border-dashed border-border cursor-pointer hover:border-foreground/20 transition-colors"
                  onClick={() => setShowAddCourseDialog(true)}
                  data-testid="empty-folder-courses"
                >
                  <BookOpen className="w-6 h-6 text-muted-foreground mb-3" strokeWidth={1.5} />
                  <p className="text-muted-foreground mb-1">No courses in this folder</p>
                  <p className="text-sm text-muted-foreground">Click to add courses</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {folderCourses.map((course, idx) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group"
                      data-testid={`folder-course-${course.id}`}
                    >
                      <Card className="h-full hover:border-foreground/20 transition-colors">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div
                              className="flex-1 cursor-pointer"
                              onClick={() => navigate(`/courses/${course.id}`)}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                {course.archived && (
                                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground bg-muted px-1.5 py-0.5">
                                    Archived
                                  </span>
                                )}
                              </div>
                              <h3 className="font-medium mb-1.5 line-clamp-2">{course.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {course.description || "No description"}
                              </p>
                              <div className="text-xs text-muted-foreground">
                                {course.totalModules || 0} modules
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeCourseFromFolder.mutate({
                                  courseId: course.id,
                                  folderId: selectedFolder.id,
                                });
                              }}
                              data-testid={`button-remove-course-${course.id}`}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        <Dialog open={showAddCourseDialog} onOpenChange={setShowAddCourseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add course to folder</DialogTitle>
              <DialogDescription>
                Select a course to add to "{selectedFolder.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {coursesNotInFolder.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  All courses are already in this folder
                </p>
              ) : (
                coursesNotInFolder.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-3 border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => {
                      addCourseToFolder.mutate({
                        courseId: course.id,
                        folderId: selectedFolder.id,
                      });
                      setShowAddCourseDialog(false);
                    }}
                    data-testid={`add-course-option-${course.id}`}
                  >
                    <div>
                      <p className="font-medium text-sm">{course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {course.totalModules || 0} modules
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </Layout>
    );
  }

  return (
    <Layout>
      <FluidBackground />
      <div className="min-h-screen relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-medium mb-1">Folders</h1>
                <p className="text-sm text-muted-foreground">
                  Organize your courses into folders
                </p>
              </div>
              <Button
                onClick={() => setShowCreateDialog(true)}
                size="sm"
                data-testid="button-create-folder"
              >
                <FolderPlus className="w-4 h-4 mr-1" />
                New folder
              </Button>
            </div>

            {foldersLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : folders.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-64 border border-dashed border-border cursor-pointer hover:border-foreground/20 transition-colors"
                onClick={() => setShowCreateDialog(true)}
                data-testid="empty-folders"
              >
                <FolderPlus className="w-6 h-6 text-muted-foreground mb-3" strokeWidth={1.5} />
                <p className="text-muted-foreground mb-1">No folders yet</p>
                <p className="text-sm text-muted-foreground">Click to create your first folder</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {folders.map((folder, idx) => (
                  <motion.div
                    key={folder.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="group"
                    data-testid={`folder-card-${folder.id}`}
                  >
                    <Card
                      className="h-full cursor-pointer hover:border-foreground/20 transition-colors"
                      onClick={() => setSelectedFolder(folder)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${folder.color || "#6366f1"}20` }}
                            >
                              <Folder
                                className="w-5 h-5"
                                style={{ color: folder.color || "#6366f1" }}
                                strokeWidth={1.5}
                              />
                            </div>
                            <div>
                              <h3 className="font-medium">{folder.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {folderCourseCounts[folder.id] || 0} courses
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFolderToDelete(folder);
                            }}
                            data-testid={`button-delete-folder-${folder.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new folder</DialogTitle>
            <DialogDescription>
              Add a name and choose a color for your folder
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Folder name</label>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g., Programming, Science..."
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                data-testid="input-folder-name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex flex-wrap gap-2">
                {FOLDER_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-lg transition-transform ${
                      newFolderColor === color ? "ring-2 ring-offset-2 ring-foreground scale-110" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewFolderColor(color)}
                    data-testid={`color-${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} data-testid="button-cancel-create">
              Cancel
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim() || createFolder.isPending}
              data-testid="button-confirm-create"
            >
              {createFolder.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!folderToDelete} onOpenChange={() => setFolderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete folder?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the folder "{folderToDelete?.name}". Courses inside will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-folder">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => folderToDelete && deleteFolder.mutate(folderToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-folder"
            >
              {deleteFolder.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
