"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
} from "react";
import { toast } from "sonner";

export type Filter = {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
};

export const FILTERS: Filter[] = [
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

const DEFAULT_VALUES = Object.fromEntries(
  FILTERS.map((f) => [f.key, f.default]),
);

interface ImageEditorContextType {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  hiddenCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  values: Record<string, number>;
  ready: boolean;
  dirty: boolean;
  loading: boolean;
  workerReady: boolean;
  error: string | null;
  debugInfo: string[];
  filterHistory: string[];
  setValues: (values: Record<string, number>) => void;
  loadImage: (file: File) => void;
  applyFilters: (v: Record<string, number>) => void;
  resetAll: () => void;
  clearLog: () => void;
  clearHistory: () => void;
  downloadImage: () => void;
}

const ImageEditorContext = createContext<ImageEditorContextType | undefined>(
  undefined,
);

export function ImageEditorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const baseImage = useRef<ImageData | null>(null);
  const renderId = useRef(0);

  const [values, setValues] = useState<Record<string, number>>(DEFAULT_VALUES);
  const [ready, setReady] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [workerReady, setWorkerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [filterHistory, setFilterHistory] = useState<string[]>([]);

  const getWorker = useCallback(() => {
    console.log("[DEBUG] [Context] Requesting worker...");
    if (!workerRef.current) {
      try {
        console.log("[DEBUG] [Context] Initializing new WebAssembly worker...");
        const worker = new Worker("/wasm/worker-enhanced.js", {
          type: "module",
        });

        // Add initialization handler
        worker.addEventListener("message", (e) => {
          if (e.data.type === "init") {
            if (e.data.success) {
              console.log(
                "[DEBUG] [Context] Worker WASM initialized successfully",
              );
              setWorkerReady(true);
              setDebugInfo((prev) => [
                ...prev,
                `[${new Date().toLocaleTimeString()}] WASM Engine loaded`,
              ]);
            } else {
              console.error(
                "[ERROR] [Context] Worker WASM initialization failed:",
                e.data.error,
              );
              setError(`WASM failed: ${e.data.error}`);
              toast.error("WASM acceleration unavailable");
            }
          }
        });

        console.log("[DEBUG] [Context] Sending 'init' signal to worker...");
        worker.postMessage({ type: "init", job: 0 });
        workerRef.current = worker;
        console.log("[DEBUG] [Context] Worker instance created");
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[ERROR] [Context] Failed to create worker:", msg);
        setError(`Worker initialization failed: ${msg}`);
        return null;
      }
    } else {
      console.log(
        "[DEBUG] [Context] Reusing existing worker (Ready:",
        workerReady,
        ")",
      );
    }
    return workerRef.current;
  }, [workerReady]);

  // Pre-initialize worker
  useEffect(() => {
    getWorker();
  }, [getWorker]);

  const loadImage = useCallback((file: File) => {
    console.log(
      "[DEBUG] [Context] loadImage triggered for:",
      file.name,
      "size:",
      file.size,
    );
    setLoading(true);
    setError(null);
    setDebugInfo((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Loading image: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
    ]);

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    console.log("[DEBUG] [Context] Created object URL for image:", url);

    img.onload = () => {
      try {
        console.log(
          "[DEBUG] [Context] Image file loaded into memory. Dimensions:",
          img.width,
          "x",
          img.height,
        );

        // Check refs
        console.log("[DEBUG] [Context] Checking canvas refs:", {
          canvas: !!canvasRef.current,
          hiddenCanvas: !!hiddenCanvasRef.current,
        });

        const c = canvasRef.current || hiddenCanvasRef.current;
        if (!c) {
          console.error(
            "[ERROR] [Context] Critical: No canvas found to draw initial image!",
          );
          throw new Error(
            "Canvas reference not found. Please ensure the Editor components are mounted.",
          );
        }

        const ctx = c.getContext("2d");
        if (!ctx) {
          console.error(
            "[ERROR] [Context] Failed to get 2D context from canvas",
          );
          throw new Error("Failed to get 2D context from canvas");
        }

        console.log("[DEBUG] [Context] Drawing image to canvas...");
        c.width = img.width;
        c.height = img.height;
        ctx.drawImage(img, 0, 0);

        console.log("[DEBUG] [Context] Extracting base image data...");
        const base = ctx.getImageData(0, 0, img.width, img.height);
        baseImage.current = base;
        console.log(
          "[DEBUG] [Context] Base image data captured. Length:",
          base.data.length,
        );

        setValues(DEFAULT_VALUES);
        setDirty(false);
        setReady(true);
        ctx.putImageData(base, 0, 0);

        setDebugInfo((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Image system ready: ${img.width}x${img.height}`,
        ]);
        toast.success("Image loaded and system ready");
        URL.revokeObjectURL(url);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(
          "[ERROR] [Context] Error during image onload process:",
          msg,
        );
        setError(`Processing error: ${msg}`);
        toast.error("Failed to process loaded image");
      } finally {
        setLoading(false);
      }
    };

    img.onerror = (e) => {
      console.error(
        "[ERROR] [Context] Image object encountered error while loading source:",
        e,
      );
      setError(
        "Failed to load image file source - check if the file is a valid image",
      );
      toast.error("Failed to load image file");
      setLoading(false);
      URL.revokeObjectURL(url);
    };
  }, []);

  const applyFilters = useCallback(
    (v: Record<string, number>) => {
      if (!baseImage.current) {
        console.warn(
          "[DEBUG] [Context] applyFilters called but no baseImage found",
        );
        return;
      }

      if (!workerReady) {
        console.warn(
          "[DEBUG] [Context] applyFilters called but WASM worker is not ready yet",
        );
        toast.info("Initializing WASM engine...");
        return;
      }

      const job = ++renderId.current;
      console.log(
        `[DEBUG] [Context] Starting render job #${job} with filters:`,
        v,
      );

      const src = baseImage.current;
      const img = new ImageData(
        new Uint8ClampedArray(src.data),
        src.width,
        src.height,
      );

      const worker = getWorker();
      if (!worker) {
        console.error(
          "[ERROR] [Context] Cannot apply filters: Worker not available",
        );
        return;
      }

      let i = 0;
      const run = () => {
        const f = FILTERS[i++];
        if (!f) {
          if (job === renderId.current) {
            console.log(
              `[DEBUG] [Context] Job #${job} completed. Updating canvas.`,
            );
            const targetCanvas = ready
              ? canvasRef.current
              : hiddenCanvasRef.current;
            if (targetCanvas) {
              targetCanvas.getContext("2d")?.putImageData(img, 0, 0);
              console.log("[DEBUG] [Context] Canvas updated successfully");
            } else {
              console.warn(
                "[DEBUG] [Context] Finished processing but targetCanvas is missing!",
              );
            }
          } else {
            console.log(
              `[DEBUG] [Context] Job #${job} discarded (newer job #${renderId.current} exists)`,
            );
          }
          return;
        }

        const amount = v[f.key];
        const prevAmount = values[f.key];

        if (amount === f.default) {
          run();
          return;
        }

        console.log(
          `[DEBUG] [Context] Sending ${f.key} (val: ${amount}) to worker for job #${job}`,
        );
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
        if (e.data.type === "init") return; // Ignore residual init messages

        if (e.data.job !== job) {
          console.log(
            `[DEBUG] [Context] Received worker message for job #${e.data.job}, ignoring (current job: #${job})`,
          );
          return;
        }

        if (e.data.success) {
          console.log(
            `[DEBUG] [Context] Filter ${e.data.type} completed successfully for job #${job}`,
          );
          img.data.set(new Uint8Array(e.data.buffer));
          run();
          setDebugInfo((prev) => [
            ...prev,
            `[Job #${job}] Filter ${e.data.type} applied (${e.data.prevAmount} → ${e.data.currentAmount})`,
          ]);
          setFilterHistory((prev) => [
            ...prev,
            `${new Date().toLocaleTimeString()}: ${e.data.type} set to ${e.data.currentAmount}`,
          ]);
        } else {
          console.error(
            `[ERROR] [Context] Worker failed to apply ${e.data.type}:`,
            e.data.error,
          );
          setError(`Filter error (${e.data.type}): ${e.data.error}`);
          toast.error(`Failed to apply ${e.data.type} filter`);
        }
      };

      run();
    },
    [getWorker, values, ready, workerReady],
  );

  const resetAll = useCallback(() => {
    console.log("[DEBUG] [Context] Resetting all filters to default");
    setValues(DEFAULT_VALUES);
    setDirty(false);
    applyFilters(DEFAULT_VALUES);
    setDebugInfo([]);
    setFilterHistory([]);
    toast.success("All filters reset");
  }, [applyFilters]);

  const clearLog = () => {
    console.log("[DEBUG] [Context] Clearing debug info log");
    setDebugInfo([]);
  };

  const clearHistory = () => {
    console.log("[DEBUG] [Context] Clearing filter history");
    setFilterHistory([]);
  };

  const downloadImage = useCallback(() => {
    console.log("[DEBUG] [Context] Preparing image download...");
    if (!canvasRef.current) {
      console.error(
        "[ERROR] [Context] Cannot download: canvasRef.current is null",
      );
      toast.error("Download failed: Canvas not found");
      return;
    }

    try {
      const link = document.createElement("a");
      link.download = `edited-image-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
      console.log("[DEBUG] [Context] Download triggered successfully");
      toast.success("Image download started");
    } catch (err) {
      console.error(
        "[ERROR] [Context] Failed to generate data URL for download:",
        err,
      );
      toast.error("Download failed to generate image data");
    }
  }, []);

  // Sync canvas when ready toggle
  useEffect(() => {
    if (ready && baseImage.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        canvasRef.current.width = baseImage.current.width;
        canvasRef.current.height = baseImage.current.height;
        ctx.putImageData(baseImage.current, 0, 0);
      }
    }
  }, [ready]);

  return (
    <ImageEditorContext.Provider
      value={{
        canvasRef,
        hiddenCanvasRef,
        values,
        ready,
        dirty,
        loading,
        workerReady,
        error,
        debugInfo,
        filterHistory,
        setValues,
        loadImage,
        applyFilters,
        resetAll,
        clearLog,
        clearHistory,
        downloadImage,
      }}
    >
      {children}
    </ImageEditorContext.Provider>
  );
}

export function useImageEditor() {
  const context = useContext(ImageEditorContext);
  if (context === undefined) {
    throw new Error(
      "useImageEditor must be used within an ImageEditorProvider",
    );
  }
  return context;
}
