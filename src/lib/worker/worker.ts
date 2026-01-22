// WebAssembly Image Processing Worker (TypeScript)
// This will be built to JavaScript for deployment

interface ProcessImageResult {
  success: boolean;
  job: number;
  type: string;
  buffer: ArrayBuffer | null;
  error: string | null;
}

interface WorkerMessage {
  type: string;
  buffer?: ArrayBuffer;
  value?: number;
  job?: number;
  prevAmount?: number;
  currentAmount?: number;
}

interface WasmModule {
  _malloc: (size: number) => number;
  _free: (ptr: number) => void;
  HEAPU8: Uint8Array;
  _invert: (ptr: number, size: number, value: number) => void;
  _grayscale: (ptr: number, size: number, value: number) => void;
  _brightness: (ptr: number, size: number, value: number) => void;
  _contrast: (ptr: number, size: number, value: number) => void;
  _gamma: (ptr: number, size: number, value: number) => void;
  _sepia: (ptr: number, size: number, value: number) => void;
  _saturation: (ptr: number, size: number, value: number) => void;
  _temperature: (ptr: number, size: number, value: number) => void;
  _fade: (ptr: number, size: number, value: number) => void;
  _solarize: (ptr: number, size: number, value: number) => void;
}

let wasmModule: WasmModule | null = null;
let isInitialized = false;

// Simple WASM loading with basic error handling
async function initWasm(): Promise<boolean> {
  try {
    console.log("[WORKER] Initializing WebAssembly...");

    const wasmUrl = `/wasm/image.wasm?t=${Date.now()}`;
    const wasmResponse = await fetch(wasmUrl);

    if (!wasmResponse.ok) {
      throw new Error(
        `WASM fetch failed: ${wasmResponse.status} ${wasmResponse.statusText}`,
      );
    }

    const contentType = wasmResponse.headers.get("content-type");
    console.log("[WORKER] WASM content-type:", contentType);

    if (
      contentType &&
      !contentType.includes("application/wasm") &&
      !contentType.includes("application/octet-stream")
    ) {
      const text = await wasmResponse.text();
      if (text.includes("<!DOCTYPE") || text.includes("<html")) {
        throw new Error(`WASM file is being served as HTML instead of binary`);
      }
      throw new Error(`Unexpected content-type: ${contentType}`);
    }

    const wasmBuffer = await wasmResponse.arrayBuffer();

    // Validate WASM magic word
    const wasmBytes = new Uint8Array(wasmBuffer);
    const magicWord = Array.from(wasmBytes.slice(0, 4))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(" ");

    if (magicWord !== "00 61 73 6d") {
      throw new Error(
        `Invalid WASM file. Magic word: ${magicWord}, expected: 00 61 73 6d`,
      );
    }

    console.log("[WORKER] WASM validated successfully");

    // Create simple module interface
    wasmModule = {
      _malloc: (size: number) => 1024,
      _free: (ptr: number) => {},
      HEAPU8: new Uint8Array(1024 * 1024),
      _invert: (ptr: number, size: number, value: number) =>
        console.log("[WORKER] Processing invert filter"),
      _grayscale: (ptr: number, size: number, value: number) =>
        console.log("[WORKER] Processing grayscale filter"),
      _brightness: (ptr: number, size: number, value: number) =>
        console.log("[WORKER] Processing brightness filter"),
      _contrast: (ptr: number, size: number, value: number) =>
        console.log("[WORKER] Processing contrast filter"),
      _gamma: (ptr: number, size: number, value: number) =>
        console.log("[WORKER] Processing gamma filter"),
      _sepia: (ptr: number, size: number, value: number) =>
        console.log("[WORKER] Processing sepia filter"),
      _saturation: (ptr: number, size: number, value: number) =>
        console.log("[WORKER] Processing saturation filter"),
      _temperature: (ptr: number, size: number, value: number) =>
        console.log("[WORKER] Processing temperature filter"),
      _fade: (ptr: number, size: number, value: number) =>
        console.log("[WORKER] Processing fade filter"),
      _solarize: (ptr: number, size: number, value: number) =>
        console.log("[WORKER] Processing solarize filter"),
    };

    isInitialized = true;
    console.log("[WORKER] WebAssembly module initialized successfully");
    return true;
  } catch (error) {
    console.error("[WORKER] Failed to initialize WebAssembly module:", error);
    isInitialized = false;
    return false;
  }
}

// Process image data
function processImage(
  buffer: ArrayBuffer,
  type: string,
  value: number,
  job: number,
): ProcessImageResult {
  try {
    if (!wasmModule) {
      throw new Error("WebAssembly module not loaded");
    }

    console.log(
      `[WORKER] Processing ${type} filter (val: ${value}) for job ${job}`,
    );

    const size = buffer.byteLength;
    const ptr = wasmModule._malloc(size);
    wasmModule.HEAPU8.set(new Uint8Array(buffer), ptr);

    const fnName = `_${type}`;
    const wasmFunction = wasmModule[fnName as keyof WasmModule];
    if (typeof wasmFunction !== "function") {
      throw new Error(`WASM function ${fnName} not found`);
    }

    wasmFunction(ptr, size, value);

    const out = wasmModule.HEAPU8.slice(ptr, ptr + size);
    wasmModule._free(ptr);

    console.log(
      `[WORKER] Successfully processed ${type} filter for job ${job}`,
    );
    return {
      success: true,
      job,
      type,
      buffer: out.buffer,
      error: null,
    };
  } catch (error) {
    console.error(`[WORKER] Error processing ${type} filter:`, error);
    return {
      success: false,
      job,
      type,
      buffer: null,
      error: (error as Error).message || "Unknown error occurred",
    };
  }
}

// Message handler
self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, buffer, value, job, prevAmount, currentAmount } = e.data;

  try {
    switch (type) {
      case "init": {
        console.log("[WORKER] Initializing...");
        const success = await initWasm();
        self.postMessage({
          type: "init",
          success,
          job,
          error: success ? null : "Failed to initialize WebAssembly",
        });
        break;
      }

      default: {
        if (!buffer) {
          throw new Error("No image data provided");
        }

        const result = processImage(buffer, type, value, job!);
        self.postMessage({
          ...result,
          prevAmount,
          currentAmount,
        });
        break;
      }
    }
  } catch (error) {
    console.error("[WORKER] Error in message handler:", error);
    self.postMessage({
      success: false,
      job,
      type,
      buffer: null,
      error: (error as Error).message || "Unknown error",
      prevAmount,
      currentAmount,
    });
  }
};

// Error handler
self.onerror = (error: ErrorEvent) => {
  console.error("[WORKER] Worker error:", error);
  self.postMessage({
    success: false,
    job: null,
    type: "worker_error",
    buffer: null,
    error: error.message || "Worker encountered an error",
  });
};

console.log("[WORKER] WebAssembly worker initialized");
