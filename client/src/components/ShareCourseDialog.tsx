import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Check, Loader2, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SharedCourse } from "@shared/schema";

interface ShareCourseDialogProps {
  courseId: string;
  courseTitle?: string;
}

export function ShareCourseDialog({ courseId, courseTitle }: ShareCourseDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: existingShare, isLoading: checkingExisting } = useQuery<SharedCourse | null>({
    queryKey: ["/api/courses", courseId, "share"],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}/share-status`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: open,
    retry: false,
  });

  const generateShareLink = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/courses/${courseId}/share`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to generate share link");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "share"] });
      toast({
        title: "Share link created",
        description: "Your course share link is ready to share!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const shareCode = existingShare?.shareCode || generateShareLink.data?.shareCode;
  const shareUrl = shareCode ? `${window.location.origin}/shared/${shareCode}` : null;

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Share link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          data-testid="button-share-course"
        >
          <Share2 className="w-4 h-4" strokeWidth={1.5} />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" data-testid="dialog-share-course">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" strokeWidth={1.5} />
            Share Course
          </DialogTitle>
          <DialogDescription>
            {courseTitle ? `Share "${courseTitle}" with others` : "Share this course with others"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {checkingExisting ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : shareUrl ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={shareUrl}
                  className="font-mono text-sm"
                  data-testid="input-share-url"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={copyToClipboard}
                  data-testid="button-copy-share-link"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with this link can view the course content (read-only).
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate a shareable link to let others view this course. They won't be able to edit or track progress.
              </p>
              <Button
                onClick={() => generateShareLink.mutate()}
                disabled={generateShareLink.isPending}
                className="w-full gap-2"
                data-testid="button-generate-share-link"
              >
                {generateShareLink.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Generate Share Link
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
