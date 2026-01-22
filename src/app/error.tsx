"use client";

import { useEffect, useState } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const errorDetails = {
    message: error.message,
    digest: error.digest,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    localStorage: Object.keys(localStorage).reduce(
      (acc, key) => {
        try {
          acc[key] = localStorage.getItem(key) ?? null;
        } catch {
          acc[key] = "[Access denied]";
        }
        return acc;
      },
      {} as Record<string, string | null>,
    ),
    sessionStorage: Object.keys(sessionStorage).reduce(
      (acc, key) => {
        try {
          acc[key] = sessionStorage.getItem(key) ?? null;
        } catch {
          acc[key] = "[Access denied]";
        }
        return acc;
      },
      {} as Record<string, string | null>,
    ),
  };

  const errorReport = {
    ...errorDetails,
    systemInfo: {
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as unknown as { deviceMemory?: number })
        .deviceMemory,
      maxTouchPoints: navigator.maxTouchPoints,
    },
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy error details");
    }
  };

  const downloadErrorReport = () => {
    const blob = new Blob([JSON.stringify(errorReport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `error-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-3xl">⚠️</span>
                Something went wrong
              </h1>
              <p className="text-red-100 mt-1">
                We encountered an unexpected error. Here's what happened:
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors backdrop-blur-sm"
            >
              Try Again
            </button>
          </div>
        </div>

        {/* Error Summary */}
        <div className="p-6 border-b border-gray-200">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="font-semibold text-red-800 mb-2">Error Summary</h2>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-mono">Message:</span>
                <span className="text-gray-800">{error.message}</span>
              </div>
              {error.digest && (
                <div className="flex items-start gap-2">
                  <span className="text-red-600 font-mono">Digest:</span>
                  <span className="text-gray-800 font-mono text-sm">
                    {error.digest}
                  </span>
                </div>
              )}
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-mono">Time:</span>
                <span className="text-gray-800">
                  {new Date().toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>{copied ? "✅" : "📋"}</span>
              {copied ? "Copied!" : "Copy Error Details"}
            </button>
            <button
              type="button"
              onClick={downloadErrorReport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <span>📥</span>
              Download Report
            </button>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span>{expanded ? "📕" : "📗"}</span>
              {expanded ? "Hide" : "Show"} Details
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <span>🔄</span>
              Reload App
            </button>
          </div>
        </div>

        {/* Detailed Error Information */}
        {expanded && (
          <div className="p-6 bg-gray-900 text-gray-100">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-green-400 mb-2">
                  Complete Error Report
                </h3>
                <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                  {JSON.stringify(errorReport, null, 2)}
                </pre>
              </div>

              {error.stack && (
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                    Stack Trace
                  </h3>
                  <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto text-xs font-mono whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="p-6 bg-blue-50 border-t border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">What to do next?</h3>
          <div className="space-y-2 text-sm text-blue-700">
            <p>
              • <strong>Copy the error details</strong> and share them with the
              development team
            </p>
            <p>
              • <strong>Try reloading the page</strong> - sometimes this
              resolves temporary issues
            </p>
            <p>
              • <strong>Check your browser console</strong> for additional error
              information
            </p>
            <p>
              • <strong>Clear your browser cache</strong> if the error persists
            </p>
            <p>
              • <strong>Report the issue</strong> with the downloaded error
              report
            </p>
          </div>

          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-xs text-blue-600">
              <strong>Debug Info:</strong> Error ID: {error.digest || "N/A"} |
              Timestamp: {Date.now()} | URL: {window.location.pathname}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
