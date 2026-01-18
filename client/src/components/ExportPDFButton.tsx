import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import type { Module } from "@shared/schema";

interface ModuleContent {
  overview?: string;
  keyPoints?: string[];
  detailedExplanation?: string;
}

interface ExportPDFButtonProps {
  courseId: string;
  courseTitle: string;
  modules: Module[];
}

export function ExportPDFButton({ courseId, courseTitle, modules }: ExportPDFButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setIsExporting(false);
      return;
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${courseTitle}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .course-header {
      text-align: center;
      margin-bottom: 48px;
      padding-bottom: 24px;
      border-bottom: 2px solid #e5e5e5;
    }
    
    .course-title {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .course-meta {
      color: #666;
      font-size: 14px;
    }
    
    .module {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    
    .module:not(:last-child) {
      page-break-after: always;
    }
    
    .module-header {
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e5e5e5;
    }
    
    .module-number {
      font-size: 12px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .module-title {
      font-size: 22px;
      font-weight: 600;
    }
    
    .section {
      margin-bottom: 24px;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #444;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    
    .overview {
      font-size: 16px;
      line-height: 1.7;
    }
    
    .key-points {
      list-style: none;
      padding: 0;
    }
    
    .key-point {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 10px;
      font-size: 15px;
    }
    
    .key-point::before {
      content: "•";
      color: #666;
      font-weight: bold;
    }
    
    .detailed-explanation {
      font-size: 15px;
      line-height: 1.8;
      white-space: pre-line;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      .course-header {
        margin-bottom: 32px;
      }
      
      .module {
        page-break-inside: avoid;
      }
      
      .module:not(:last-child) {
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <div class="course-header">
    <h1 class="course-title">${escapeHtml(courseTitle)}</h1>
    <p class="course-meta">${modules.length} modules</p>
  </div>
  
  ${modules.map((module, index) => {
    const content = module.content as ModuleContent | null;
    return `
    <div class="module">
      <div class="module-header">
        <p class="module-number">Module ${index + 1}</p>
        <h2 class="module-title">${escapeHtml(module.title)}</h2>
      </div>
      
      ${content?.overview ? `
      <div class="section">
        <h3 class="section-title">Overview</h3>
        <p class="overview">${escapeHtml(content.overview)}</p>
      </div>
      ` : ''}
      
      ${content?.keyPoints && content.keyPoints.length > 0 ? `
      <div class="section">
        <h3 class="section-title">Key Points</h3>
        <ul class="key-points">
          ${content.keyPoints.map(point => `<li class="key-point">${escapeHtml(point)}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
      
      ${content?.detailedExplanation ? `
      <div class="section">
        <h3 class="section-title">Detailed Explanation</h3>
        <p class="detailed-explanation">${escapeHtml(content.detailedExplanation)}</p>
      </div>
      ` : ''}
    </div>
    `;
  }).join('')}
</body>
</html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.print();
      setIsExporting(false);
    };

    setTimeout(() => {
      setIsExporting(false);
    }, 3000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting || modules.length === 0}
      className="gap-2"
      data-testid="button-export-pdf"
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4" strokeWidth={1.5} />
      )}
      Export PDF
    </Button>
  );
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
