"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

type Filter = {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
};

const filters: Filter[] = [
  { key: "invert", label: "Invert", min: 0, max: 1, step: 0.01, default: 0 },
  {
    key: "grayscale",
    label: "Grayscale",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0,
  },
  {
    key: "brightness",
    label: "Brightness",
    min: -100,
    max: 100,
    step: 1,
    default: 0,
  },
  {
    key: "contrast",
    label: "Contrast",
    min: 0.5,
    max: 2.5,
    step: 0.01,
    default: 1,
  },
  { key: "gamma", label: "Gamma", min: 0.5, max: 2, step: 0.01, default: 1 },
  { key: "sepia", label: "Sepia", min: 0, max: 1, step: 0.01, default: 0 },
  {
    key: "saturation",
    label: "Saturation",
    min: 0,
    max: 2,
    step: 0.01,
    default: 1,
  },
  {
    key: "temperature",
    label: "Temperature",
    min: -1,
    max: 1,
    step: 0.01,
    default: 0,
  },
  { key: "fade", label: "Fade", min: 0, max: 1, step: 0.01, default: 0 },
  {
    key: "solarize",
    label: "Solarize",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0,
  },
];

const defaultValues = Object.fromEntries(
  filters.map((f) => [f.key, f.default]),
);

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const baseImage = useRef<ImageData | null>(null);
  const renderId = useRef(0);

  const [values, setValues] = useState<Record<string, number>>(defaultValues);
  const [ready, setReady] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [filterHistory, setFilterHistory] = useState<string[]>([]);

  const getWorker = useCallback(() => {
    console.log("[DEBUG] Creating WebAssembly worker...");
    if (!workerRef.current) {
      try {
        workerRef.current = new Worker("/wasm/worker-enhanced.js", {
          type: "module",
        });
        console.log("[DEBUG] Enhanced worker created successfully");
      } catch (err) {
        console.error("[ERROR] Failed to create worker:", err);
        setError("Failed to initialize image processing worker");
        return null;
      }
    } else {
      console.log("[DEBUG] Reusing existing worker");
    }
    return workerRef.current;
  }, []);

  function load(file: File) {
    console.log("[DEBUG] Loading image:", file.name, file.size, file.type);
    setLoading(true);
    setError(null);
    setDebugInfo((prev) => [
      ...prev,
      `Loading image: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
    ]);

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      try {
        console.log(
          "[DEBUG] Image loaded, dimensions:",
          img.width,
          "x",
          img.height,
        );
        const c = canvasRef.current;
        if (!c) {
          throw new Error("Canvas reference not found");
        }

        const ctx = c.getContext("2d");
        if (!ctx) {
          throw new Error("Failed to get 2D context");
        }

        c.width = img.width;
        c.height = img.height;
        ctx.drawImage(img, 0, 0);

        const base = ctx.getImageData(0, 0, img.width, img.height);
        baseImage.current = base;

        console.log(
          "[DEBUG] Base image data captured, length:",
          base.data.length,
        );

        setValues(defaultValues);
        setDirty(false);
        setReady(true);

        ctx.putImageData(base, 0, 0);

        setDebugInfo((prev) => [
          ...prev,
          `Image loaded successfully: ${img.width}x${img.height}`,
        ]);
        toast.success("Image loaded successfully");
      } catch (err) {
        console.error("[ERROR] Failed to load image:", err);
        setError("Failed to load image");
        toast.error("Failed to load image");
      } finally {
        setLoading(false);
      }
    };

    img.onerror = () => {
      console.error("[ERROR] Failed to load image file");
      setError(
        "Failed to load image file - may be corrupted or unsupported format",
      );
      toast.error("Failed to load image file");
      setLoading(false);
    };
  }

  const applyAll = useCallback(
    (v: Record<string, number>) => {
      console.log("[DEBUG] Applying filters:", Object.keys(v), v);
      console.log(
        "[DEBUG] Previous values:",
        Object.keys(values).map((k) => `${k}: ${values[k]}`),
      );

      if (!baseImage.current) {
        console.error("[ERROR] No base image loaded");
        setError("No image loaded to apply filters to");
        toast.error("Please load an image first");
        return;
      }

      const job = ++renderId.current;
      console.log("[DEBUG] Starting render job:", job);

      const src = baseImage.current;
      const img = new ImageData(
        new Uint8ClampedArray(src.data),
        src.width,
        src.height,
      );

      const worker = getWorker();
      if (!worker) {
        setError("Image processing worker not available");
        return;
      }

      let i = 0;

      const run = () => {
        const f = filters[i++];
        if (!f) {
          if (job === renderId.current) {
            console.log("[DEBUG] All filters applied, updating canvas");
            canvasRef.current?.getContext("2d")?.putImageData(img, 0, 0);
          }
          return;
        }

        const amount = v[f.key];
        const prevAmount = values[f.key];
        console.log(
          `[DEBUG] Applying filter ${f.key}:`,
          amount,
          `(previous: ${prevAmount})`,
        );

        if (amount === f.default) {
          run();
          return;
        }

        worker.postMessage({
          buffer: img.data.slice().buffer,
          type: f.key,
          value: amount,
          job,
          prevAmount: prevAmount,
          currentAmount: amount,
        });
      };

      worker.onmessage = (e) => {
        console.log(
          `[DEBUG] Worker response for job ${e.data.job}:`,
          e.data.type,
          e.data.success,
        );

        if (e.data.job !== job) return;

        if (e.data.success) {
          img.data.set(new Uint8Array(e.data.buffer));
          run();
          setDebugInfo((prev) => [
            ...prev,
            `Filter ${e.data.type} applied successfully (${e.data.prevAmount} → ${e.data.currentAmount})`,
          ]);
          setFilterHistory((prev) => [
            ...prev,
            `${new Date().toISOString()}: ${e.data.type} changed from ${e.data.prevAmount} to ${e.data.currentAmount}`,
          ]);
        } else {
          console.error(`[ERROR] Filter ${e.data.type} failed:`, e.data.error);
          setError(`Failed to apply ${e.data.type} filter`);
          toast.error(`Failed to apply ${e.data.type} filter`);
        }
      };

      worker.onerror = (err) => {
        console.error("[ERROR] Worker error:", err);
        setError("Image processing worker encountered an error");
        toast.error("Image processing failed");
      };

      run();
    },
    [getWorker, values],
  );

  return (
    <div className="h-screen grid grid-cols-[1fr_360px] bg-background text-foreground">
      {/* Canvas */}
      <div className="flex flex-col items-center justify-center bg-background p-8">
        {!ready ? (
          <div className="w-full max-w-md space-y-4">
            {/* Error Display */}
            {error && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-destructive rounded-full flex items-center justify-center">
                    <span className="text-destructive-foreground text-sm font-bold">
                      !
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-destructive-foreground">
                      Error
                    </h3>
                    <p className="text-destructive-foreground">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="w-full max-w-md space-y-4">
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-blue-500 text-sm font-bold">⟳</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-700">
                        Loading...
                      </h3>
                      <p className="text-blue-600">Processing your image</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Debug Information */}
            {debugInfo.length > 0 && (
              <div className="w-full max-w-md mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Debug Information
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDebugInfo([]);
                      toast.success("Debug log cleared");
                    }}
                  >
                    Clear Log
                  </Button>
                </div>
                <div className="space-y-1 text-sm font-mono max-h-32 overflow-y-auto">
                  {debugInfo.map((info, index) => (
                    <div
                      key={`debug-${index}-${info.slice(0, 20)}`}
                      className="text-gray-600 py-1 border-b border-gray-100 last:border-b-0"
                    >
                      {info}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filter History */}
            {filterHistory.length > 0 && (
              <div className="w-full max-w-md mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Filter History
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilterHistory([]);
                      toast.success("Filter history cleared");
                    }}
                  >
                    Clear History
                  </Button>
                </div>
                <div className="space-y-1 text-sm font-mono max-h-32 overflow-y-auto">
                  {filterHistory.map((entry, index) => (
                    <div
                      key={`history-${index}-${entry.slice(0, 20)}`}
                      className="text-gray-600 py-1 border-b border-gray-100 last:border-b-0"
                    >
                      {entry}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Interface */}
            {!error && !loading && (
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      load(e.target.files[0]);
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const div = e.currentTarget as HTMLElement;
                    div.classList.add("border-blue-400", "bg-blue-50");
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const div = e.currentTarget as HTMLElement;
                    div.classList.remove("border-blue-400", "bg-blue-50");
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const div = e.currentTarget as HTMLElement;
                    div.classList.remove("border-blue-400", "bg-blue-50");

                    const files = e.dataTransfer.files;
                    if (files?.[0]) {
                      load(files[0]);
                    } else {
                      console.log("[DEBUG] No files dropped");
                      toast.error("No valid image file dropped");
                    }
                  }}
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <div className="mb-4">
                    <svg
                      className="w-12 h-12 mx-auto text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      role="img"
                      aria-label="Upload icon"
                    >
                      <title>Upload image</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 014 4 0 0-4-4 0M7 20a2 2 0 012-2 2 0 01-2 2m0 6a2 2 0 012 2 2 0 01-2 2"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drag & drop an image here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full border border-border rounded-lg shadow-lg mb-4"
            />
            <p className="text-center text-sm text-muted-foreground">
              Image loaded - adjust filters below
            </p>
          </div>
        )}
      </div>

      <Card className="rounded-none border-l border-border gap-2 bg-background">
        <CardHeader className="p-2">
          <CardTitle>Adjustments</CardTitle>
          <CardDescription>
            Adjust the image using various filters.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2">
          {filters.map((f) => (
            <div
              key={f.key}
              className="flex flex-row mb-2 rounded-md gap-4 bg-background p-2 border"
            >
              <div className="w-full pb-2">
                <div className="flex justify-between text-sm mb-2">
                  <span>{f.label}</span>
                  <span className="text-muted-foreground">
                    {values[f.key].toFixed(2)}
                  </span>
                </div>
                <Slider
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={[values[f.key]]}
                  disabled={!ready || loading}
                  onClick={() => {
                    const next = { ...values, [f.key]: f.default };
                    setValues(next);
                    setDirty(true);
                    console.log(
                      `[DEBUG] User clicked reset for ${f.key}, current value: ${values[f.key]}, resetting to: ${f.default}`,
                    );
                    applyAll(next);
                  }}
                />
              </div>
              <div className=" flex justify-center items-center ">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!ready || values[f.key] === f.default}
                  onClick={() => {
                    const next = { ...values, [f.key]: f.default };
                    setValues(next);
                    applyAll(next);
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          ))}

          <Separator />

          <Button
            variant="secondary"
            disabled={!ready || !dirty || loading}
            onClick={() => {
              console.log(
                "[DEBUG] User clicked reset all, current values:",
                Object.keys(values).map((k) => `${k}: ${values[k]}`),
              );
              setValues(defaultValues);
              setDirty(false);
              applyAll(defaultValues);
              setDebugInfo([]);
              setFilterHistory([]);
              toast.success("All filters reset and debug cleared");
            }}
          >
            Reset All
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
