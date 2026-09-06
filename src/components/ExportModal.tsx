import React, { useState } from 'react';
import { exportJournalData } from '../lib/api';
import { MaterialSymbol } from './MaterialSymbol';

interface ExportModalProps {
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportData, setExportData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchExport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await exportJournalData();
      setExportData(data);
      return data;
    } catch (err: any) {
      setError(err?.message || 'Failed to generate export');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadJson = async () => {
    let data = exportData;
    if (!data) {
      data = await fetchExport();
    }
    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini-journal-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = async () => {
    let data = exportData;
    if (!data) {
      data = await fetchExport();
    }
    if (!data) return;

    let md = `# Personal Gemini Journal Archive\n`;
    md += `*Exported on: ${new Date(data.exportedAt).toLocaleString()}*\n`;
    md += `*Security Isolation: ${data.securityIsolation}*\n\n---\n\n`;

    data.sessions?.forEach((s: any) => {
      md += `## ${s.title}\n`;
      md += `*Date: ${new Date(s.createdAt).toLocaleString()}*\n`;
      if (s.summary) {
        md += `\n> **Executive Summary**: ${s.summary.summaryText}\n`;
        if (s.summary.keyThemes?.length) {
          md += `> **Themes**: ${s.summary.keyThemes.join(', ')}\n`;
        }
      }
      if (s.actionItems?.length) {
        md += `\n### Action Items & Commitments\n\n`;
        s.actionItems.forEach((act: any) => {
          md += `- [${act.completed ? 'x' : ' '}] ${act.text}\n`;
        });
      }
      md += `\n### Conversation Record\n\n`;
      s.messages?.forEach((m: any) => {
        const role = m.role === 'user' ? '**You**' : '**Gemini**';
        md += `${role} *(${new Date(m.createdAt).toLocaleTimeString()})*:\n${m.text}\n\n`;
      });
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini-journal-export-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPlainText = async () => {
    let data = exportData;
    if (!data) {
      data = await fetchExport();
    }
    if (!data) return;

    let txt = `====================================================\n`;
    txt += `PERSONAL GEMINI JOURNAL ARCHIVE\n`;
    txt += `Exported: ${new Date(data.exportedAt).toLocaleString()}\n`;
    txt += `Security: Isolated UID Space\n`;
    txt += `====================================================\n\n`;

    data.sessions?.forEach((s: any, idx: number) => {
      txt += `ENTRY ${idx + 1}: ${s.title.toUpperCase()}\n`;
      txt += `Date: ${new Date(s.createdAt).toLocaleString()}\n`;
      txt += `----------------------------------------------------\n`;
      if (s.summary) {
        txt += `SUMMARY: ${s.summary.summaryText}\n\n`;
      }
      if (s.actionItems?.length) {
        txt += `ACTION ITEMS:\n`;
        s.actionItems.forEach((act: any) => {
          txt += `  [${act.completed ? 'COMPLETED' : 'PENDING'}] ${act.text}\n`;
        });
        txt += `\n`;
      }
      txt += `CONVERSATION:\n`;
      s.messages?.forEach((m: any) => {
        const role = m.role === 'user' ? 'YOU' : 'GEMINI';
        txt += `[${new Date(m.createdAt).toLocaleTimeString()}] ${role}:\n${m.text}\n\n`;
      });
      txt += `\n====================================================\n\n`;
    });

    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini-journal-export-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyClipboard = async () => {
    let data = exportData;
    if (!data) {
      data = await fetchExport();
    }
    if (!data) return;

    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-[24px] w-full max-w-xl flex flex-col shadow-2xl overflow-hidden text-[var(--md-sys-color-on-surface)] animate-in fade-in zoom-in-95 duration-200"
        style={{ boxShadow: 'var(--md-elevation-3)' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--md-sys-color-outline-variant)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
              <MaterialSymbol name="download" size={20} />
            </div>
            <div>
              <h3 className="text-base font-['Google_Sans',sans-serif] font-medium text-[var(--md-sys-color-on-surface)]">
                Export Encrypted Journal
              </h3>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                Download your complete journal history and AI reflections in open formats.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-export-modal-btn"
            onClick={onClose}
            aria-label="Close export dialog"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)] hover:text-[var(--md-sys-color-on-surface)] transition cursor-pointer"
          >
            <MaterialSymbol name="close" size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] flex items-center gap-2 border border-[var(--md-sys-color-error)]/30">
              <MaterialSymbol name="error" size={18} />
              <span>{error}</span>
            </div>
          )}

          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            Your journal data is stored with zero-trust isolation and never shared. You can archive your complete history at any time:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* JSON Option */}
            <button
              type="button"
              onClick={handleDownloadJson}
              disabled={loading}
              className="p-3.5 rounded-[16px] bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-left transition flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="w-7 h-7 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
                  <MaterialSymbol name="data_object" size={16} />
                </div>
                <MaterialSymbol name="download" size={16} className="text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-primary)] transition" />
              </div>
              <div>
                <span className="font-['Google_Sans',sans-serif] font-medium text-xs text-[var(--md-sys-color-on-surface)] block">
                  JSON Archive
                </span>
                <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] mt-0.5 block leading-tight">
                  Machine structured backup format.
                </span>
              </div>
            </button>

            {/* Markdown Option */}
            <button
              type="button"
              onClick={handleDownloadMarkdown}
              disabled={loading}
              className="p-3.5 rounded-[16px] bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-left transition flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="w-7 h-7 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
                  <MaterialSymbol name="description" size={16} />
                </div>
                <MaterialSymbol name="download" size={16} className="text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-primary)] transition" />
              </div>
              <div>
                <span className="font-['Google_Sans',sans-serif] font-medium text-xs text-[var(--md-sys-color-on-surface)] block">
                  Markdown (.md)
                </span>
                <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] mt-0.5 block leading-tight">
                  Rich formatting for Notion & Obsidian.
                </span>
              </div>
            </button>

            {/* Plain Text Option */}
            <button
              type="button"
              onClick={handleDownloadPlainText}
              disabled={loading}
              className="p-3.5 rounded-[16px] bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-left transition flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="w-7 h-7 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
                  <MaterialSymbol name="article" size={16} />
                </div>
                <MaterialSymbol name="download" size={16} className="text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-primary)] transition" />
              </div>
              <div>
                <span className="font-['Google_Sans',sans-serif] font-medium text-xs text-[var(--md-sys-color-on-surface)] block">
                  Plain Text (.txt)
                </span>
                <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] mt-0.5 block leading-tight">
                  Clean text without any syntax tags.
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopyClipboard}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-full text-xs font-['Google_Sans',sans-serif] font-medium text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container)] transition cursor-pointer flex items-center gap-1.5"
          >
            <MaterialSymbol name={copied ? 'check' : 'content_copy'} size={16} />
            <span>{copied ? 'Copied JSON!' : 'Copy to Clipboard'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs font-['Google_Sans',sans-serif] font-medium bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-90 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
