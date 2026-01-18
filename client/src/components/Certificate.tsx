import { useRef } from "react";
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
import { Award, Download, Loader2, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { Certificate as CertificateType } from "@shared/schema";

interface CertificateProps {
  courseId: string;
  courseTitle: string;
  isComplete: boolean;
}

export function Certificate({ courseId, courseTitle, isComplete }: CertificateProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const certificateRef = useRef<HTMLDivElement>(null);

  const { data: certificate, isLoading } = useQuery<CertificateType | null>({
    queryKey: ["/api/certificates", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/certificates/${courseId}`, { credentials: "include" });
      if (!res.ok) return null;
      const data = await res.json();
      return data || null;
    },
    enabled: isComplete,
  });

  const generateCertificate = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/certificates/${courseId}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to generate certificate");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/certificates", courseId] });
      toast({
        title: "Certificate Generated!",
        description: "Your completion certificate is ready.",
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

  const handlePrint = () => {
    const printContent = certificateRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${courseTitle}</title>
          <style>
            @page { size: landscape; margin: 0; }
            body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; }
            .certificate { width: 900px; padding: 60px; background: linear-gradient(135deg, #fafafa 0%, #ffffff 50%, #fafafa 100%); border: 8px double #1a1a1a; box-shadow: 0 0 0 4px #ffffff, 0 0 0 8px #1a1a1a; font-family: Georgia, serif; text-align: center; }
            .certificate-header { font-size: 14px; letter-spacing: 4px; text-transform: uppercase; color: #666; margin-bottom: 20px; }
            .certificate-title { font-size: 48px; font-weight: bold; color: #1a1a1a; margin: 20px 0; font-family: 'Times New Roman', serif; }
            .certificate-subtitle { font-size: 18px; color: #444; margin: 10px 0; }
            .certificate-name { font-size: 36px; font-weight: bold; color: #1a1a1a; margin: 30px 0; font-style: italic; border-bottom: 2px solid #1a1a1a; display: inline-block; padding: 0 40px 10px; }
            .certificate-course { font-size: 24px; color: #333; margin: 20px 0; }
            .certificate-date { font-size: 16px; color: #666; margin-top: 40px; }
            .certificate-code { font-size: 12px; color: #999; margin-top: 20px; font-family: monospace; }
            .certificate-decoration { display: flex; justify-content: center; gap: 20px; margin: 30px 0; }
            .decoration-line { width: 100px; height: 2px; background: linear-gradient(90deg, transparent, #1a1a1a, transparent); }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (!isComplete) {
    return null;
  }

  const userName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.firstName || user?.email?.split("@")[0] || "Student";
  
  const completionDate = certificate?.completedAt 
    ? new Date(certificate.completedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          data-testid="button-view-certificate"
        >
          <Award className="w-4 h-4" strokeWidth={1.5} />
          {certificate ? "View Certificate" : "Get Certificate"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl" data-testid="dialog-certificate">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" strokeWidth={1.5} />
            Course Completion Certificate
          </DialogTitle>
          <DialogDescription>
            Congratulations on completing the course!
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : certificate ? (
          <div className="space-y-4">
            <div
              ref={certificateRef}
              className="certificate bg-gradient-to-br from-zinc-50 via-white to-zinc-50 border-8 border-double border-zinc-900 p-12 text-center mx-auto"
              style={{ maxWidth: "800px" }}
              data-testid="certificate-display"
            >
              <div className="text-xs tracking-[4px] uppercase text-zinc-500 mb-4">
                Certificate of Completion
              </div>
              
              <div className="flex justify-center gap-4 my-4">
                <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-zinc-900 to-transparent" />
                <Award className="w-8 h-8 text-yellow-600" />
                <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-zinc-900 to-transparent" />
              </div>

              <h1 className="text-4xl font-bold text-zinc-900 my-4 font-serif">
                Certificate of Achievement
              </h1>

              <p className="text-lg text-zinc-600 mb-6">This is to certify that</p>

              <div className="text-3xl font-bold text-zinc-900 italic border-b-2 border-zinc-900 inline-block px-10 pb-2 mb-6" data-testid="text-certificate-name">
                {userName}
              </div>

              <p className="text-lg text-zinc-600 mb-4">has successfully completed the course</p>

              <h2 className="text-2xl font-semibold text-zinc-800 mb-8" data-testid="text-certificate-course">
                {courseTitle}
              </h2>

              <p className="text-sm text-zinc-500" data-testid="text-certificate-date">
                Completed on {completionDate}
              </p>

              <p className="text-xs text-zinc-400 mt-4 font-mono" data-testid="text-certificate-code">
                Certificate ID: {certificate.certificateCode}
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={handlePrint} className="gap-2" data-testid="button-print-certificate">
                <Printer className="w-4 h-4" />
                Print
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <Award className="w-16 h-16 mx-auto text-yellow-500" strokeWidth={1} />
            <div>
              <h3 className="text-lg font-medium mb-2">Congratulations!</h3>
              <p className="text-muted-foreground mb-4">
                You've completed all modules in this course. Generate your certificate to celebrate your achievement!
              </p>
            </div>
            <Button
              onClick={() => generateCertificate.mutate()}
              disabled={generateCertificate.isPending}
              className="gap-2"
              data-testid="button-generate-certificate"
            >
              {generateCertificate.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  Generate Certificate
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
