"use client";

import React from "react";
import { useImageEditor, FILTERS } from "@/lib/image-context";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Settings2,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/error-boundary";

/**
 * Editor Main Wrapper
 */
export function Editor({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary name="Editor Main">
      <div className="h-screen grid grid-cols-[1fr_360px] bg-background text-foreground overflow-hidden">
        {children}
      </div>
    </ErrorBoundary>
  );
}

/**
 * Editor Canvas Display
 */
Editor.Canvas = function EditorCanvas() {
  const {
    canvasRef,
    hiddenCanvasRef,
    ready,
    loadImage,
    error,
    loading,
    workerReady,
    debugInfo,
    filterHistory,
    clearLog,
    clearHistory,
  } = useImageEditor();

  return (
    <ErrorBoundary name="Editor Canvas">
      <div className="flex flex-col items-center justify-center bg-muted/30 p-8 h-full relative">
        {/* Hidden canvas for image processing when not ready */}
        <canvas ref={hiddenCanvasRef} className="hidden" aria-hidden="true" />

        {!workerReady && (
          <div className="absolute top-4 left-4 z-20">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm border rounded-full shadow-sm text-[10px] font-medium animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span>Initializing WASM Engine...</span>
            </div>
          </div>
        )}

        {!ready ? (
          <div className="w-full max-w-md space-y-6">
            {error && (
              <Card className="border-destructive/50 bg-destructive/10">
                <CardHeader className="flex flex-row items-center gap-2 p-4">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <CardTitle className="text-destructive">Error</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-sm text-destructive">{error}</p>
                </CardContent>
              </Card>
            )}

            {loading && (
              <div className="flex flex-col items-center gap-4 p-8 bg-card rounded-xl border shadow-sm">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-center">
                  <h3 className="font-semibold">Processing...</h3>
                  <p className="text-sm text-muted-foreground">
                    Adjusting your image with WebAssembly
                  </p>
                </div>
              </div>
            )}

            {!loading && !error && (
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      loadImage(e.target.files[0]);
                    }
                  }}
                />
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-2xl p-12 text-center transition-all group-hover:border-primary group-hover:bg-primary/5">
                  <div className="mb-4 flex justify-center">
                    <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
                      <Upload className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Upload Image</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop or click to browse
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {["PNG", "JPG", "WEBP"].map((ext) => (
                      <span
                        key={ext}
                        className="px-2 py-1 text-[10px] bg-muted rounded font-mono border"
                      >
                        {ext}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {(debugInfo.length > 0 || filterHistory.length > 0) && (
              <div className="grid grid-cols-2 gap-4">
                {debugInfo.length > 0 && (
                  <Card className="bg-muted/50">
                    <CardHeader className="p-3 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-mono uppercase">
                        System Log
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={clearLog}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <ScrollArea className="h-32 text-[10px] font-mono leading-tight">
                        {debugInfo.map((line, i) => (
                          <div
                            key={`debug-${i}-${line.slice(0, 20)}`}
                            className="mb-1 text-muted-foreground"
                          >
                            {line}
                          </div>
                        ))}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
                {filterHistory.length > 0 && (
                  <Card className="bg-muted/50">
                    <CardHeader className="p-3 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-mono uppercase">
                        History
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={clearHistory}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <ScrollArea className="h-32 text-[10px] font-mono leading-tight">
                        {filterHistory.map((line, i) => (
                          <div
                            key={`history-${i}-${line.slice(0, 20)}`}
                            className="mb-1 text-muted-foreground"
                          >
                            {line}
                          </div>
                        ))}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative shadow-2xl rounded-lg overflow-hidden border bg-card max-w-full max-h-full">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain cursor-crosshair block"
              />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-background px-3 py-1.5 rounded-full border shadow-sm">
              <ImageIcon className="h-3 w-3" />
              <span>Canvas Ready</span>
              <Separator orientation="vertical" className="h-3 mx-1" />
              <span className="font-mono uppercase">WASM Accelerated</span>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

/**
 * Editor Sidebar Wrapper
 */
Editor.Sidebar = function EditorSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary name="Editor Sidebar">
      <aside className="border-l bg-card flex flex-col h-full shadow-inner">
        {children}
      </aside>
    </ErrorBoundary>
  );
};

/**
 * Editor Filter List
 */
Editor.Filters = function EditorFilters() {
  const { values, setValues, applyFilters, ready, loading, workerReady } =
    useImageEditor();

  return (
    <ErrorBoundary name="Editor Filters">
      <ScrollArea className="flex-1 px-4">
        <div className="py-6 space-y-6">
          <div className="flex items-center gap-2 px-1">
            <Settings2 className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm">Image Adjustments</h2>
          </div>

          <div className="space-y-4">
            {FILTERS.map((f) => (
              <div key={f.key} className="space-y-3 group px-1">
                <div className="flex justify-between items-center group-hover:scale-[1.01] transition-transform">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {f.label}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border">
                      {values[f.key].toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
                        values[f.key] !== f.default &&
                          "text-primary opacity-100",
                      )}
                      onClick={() => {
                        const next = { ...values, [f.key]: f.default };
                        setValues(next);
                        applyFilters(next);
                      }}
                      disabled={
                        !ready || !workerReady || values[f.key] === f.default
                      }
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Slider
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={[values[f.key]]}
                  disabled={!ready || !workerReady || loading}
                  onValueChange={([val]) => {
                    const next = { ...values, [f.key]: val };
                    setValues(next);
                  }}
                  onValueCommit={([val]) => {
                    const next = { ...values, [f.key]: val };
                    applyFilters(next);
                  }}
                  className="py-2"
                />
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </ErrorBoundary>
  );
};

/**
 * Editor Top/Bottom Actions
 */
Editor.Actions = function EditorActions() {
  const {
    ready,
    dirty,
    loading,
    workerReady,
    resetAll,
    downloadImage,
    loadImage,
  } = useImageEditor();

  return (
    <div className="p-4 border-t bg-muted/20 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={resetAll}
          disabled={!ready || !workerReady || loading}
        >
          <RotateCcw className="mr-2 h-3.5 w-3.5" />
          Reset All
        </Button>
        <Button
          variant="default"
          size="sm"
          className="w-full text-xs shadow-sm shadow-primary/20"
          onClick={downloadImage}
          disabled={!ready || !workerReady || loading}
        >
          <Download className="mr-2 h-3.5 w-3.5" />
          Download
        </Button>
      </div>

      {ready && (
        <div className="relative group">
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                loadImage(e.target.files[0]);
              }
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground"
          >
            <Upload className="mr-2 h-3.5 w-3.5" />
            Switch Image
          </Button>
        </div>
      )}
    </div>
  );
};
