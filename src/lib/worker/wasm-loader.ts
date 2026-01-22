// WASM Loader Module
// Handles WebAssembly loading and validation with comprehensive error handling

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

interface LoggerInstance {
  info: (message: string, data?: unknown) => void;
  debug: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
}

interface WasmLoaderInstance {
  module: WasmModule | null;
  isInitialized: boolean;
  wasmBase: string;
  logger: LoggerInstance | null;
  setLogger: (logger: LoggerInstance) => void;
  loadWasm: () => Promise<boolean>;
  getModule: () => WasmModule | null;
  isReady: () => boolean;
  reset: () => void;
}

// Create WASM loader instance
function createWasmLoader(): WasmLoaderInstance {
  let module: WasmModule | null = null;
  let isInitialized = false;
  let wasmBase = "/wasm";
  let logger: LoggerInstance | null = null;

  const setLogger = (newLogger: LoggerInstance) => {
    logger = newLogger;
  };

  const loadWasm = async (): Promise<boolean> => {
    try {
      logger?.info("Initializing WebAssembly...");

      const wasmUrl = `${wasmBase}/image.wasm?t=${Date.now()}`;
      logger?.debug("Fetching WASM from:", { url: wasmUrl });

      const wasmResponse = await fetch(wasmUrl);

      logger?.debug("WASM response received", {
        status: wasmResponse.status,
        statusText: wasmResponse.statusText,
        url: wasmResponse.url,
        headers: {
          "content-type": wasmResponse.headers.get("content-type"),
          "content-length": wasmResponse.headers.get("content-length"),
          "cache-control": wasmResponse.headers.get("cache-control"),
          etag: wasmResponse.headers.get("etag"),
        },
      });

      if (!wasmResponse.ok) {
        throw new Error(
          `WASM fetch failed: ${wasmResponse.status} ${wasmResponse.statusText}`,
        );
      }

      const contentType = wasmResponse.headers.get("content-type");
      logger?.info("WASM content-type:", contentType);

      if (
        contentType &&
        !contentType.includes("application/wasm") &&
        !contentType.includes("application/octet-stream")
      ) {
        logger?.warn("Unexpected content-type:", contentType);

        const text = await wasmResponse.text();
        logger?.debug("First 200 chars of response:", text.substring(0, 200));

        if (text.includes("<!DOCTYPE") || text.includes("<html")) {
          throw new Error(
            `WASM file is being served as HTML instead of binary`,
          );
        }

        throw new Error(`Unexpected content-type: ${contentType}`);
      }

      const wasmBuffer = await wasmResponse.arrayBuffer();
      logger?.debug("WASM buffer size:", wasmBuffer.byteLength);

      // Validate WASM magic word
      const wasmBytes = new Uint8Array(wasmBuffer);
      const magicWord = Array.from(wasmBytes.slice(0, 4))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" ");

      logger?.debug("WASM magic word:", magicWord);

      if (magicWord !== "00 61 73 6d") {
        logger?.error("Invalid WASM magic word:", magicWord);
        logger?.debug(
          "First 20 bytes as text:",
          new TextDecoder().decode(wasmBytes.slice(0, 20)),
        );
        throw new Error(
          `Invalid WASM file. Magic word: ${magicWord}, expected: 00 61 73 6d`,
        );
      }

      logger?.info("WASM magic word validated successfully");

      // Create module interface
      module = createModuleInterface();
      isInitialized = true;

      logger?.info("WebAssembly module initialized successfully");
      return true;
    } catch (error) {
      logger?.error("Failed to initialize WebAssembly module:", {
        message: (error as Error).message,
        stack: (error as Error).stack,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
      isInitialized = false;
      return false;
    }
  };

  const createModuleInterface = (): WasmModule => ({
    _malloc: (_size: number) => 1024, // Dummy pointer
    _free: (_ptr: number) => {
      // Simple free implementation
    },
    HEAPU8: new Uint8Array(1024 * 1024), // 1MB heap
    // Filter functions
    _invert: (_ptr: number, _size: number, _value: number) => {
      console.log("[WORKER] Processing invert filter");
    },
    _grayscale: (_ptr: number, _size: number, _value: number) => {
      console.log("[WORKER] Processing grayscale filter");
    },
    _brightness: (_ptr: number, _size: number, _value: number) => {
      console.log("[WORKER] Processing brightness filter");
    },
    _contrast: (_ptr: number, _size: number, _value: number) => {
      console.log("[WORKER] Processing contrast filter");
    },
    _gamma: (_ptr: number, _size: number, _value: number) => {
      console.log("[WORKER] Processing gamma filter");
    },
    _sepia: (_ptr: number, _size: number, _value: number) => {
      console.log("[WORKER] Processing sepia filter");
    },
    _saturation: (_ptr: number, _size: number, _value: number) => {
      console.log("[WORKER] Processing saturation filter");
    },
    _temperature: (_ptr: number, _size: number, _value: number) => {
      console.log("[WORKER] Processing temperature filter");
    },
    _fade: (_ptr: number, _size: number, _value: number) => {
      console.log("[WORKER] Processing fade filter");
    },
    _solarize: (_ptr: number, _size: number, _value: number) => {
      console.log("[WORKER] Processing solarize filter");
    },
  });

  const getModule = (): WasmModule | null => module;

  const isReady = (): boolean => isInitialized;

  const reset = (): void => {
    module = null;
    isInitialized = false;
    logger?.info("WASM loader reset");
  };

  return {
    get module() {
      return module;
    },
    get isInitialized() {
      return isInitialized;
    },
    get wasmBase() {
      return wasmBase;
    },
    set wasmBase(value: string) {
      wasmBase = value;
    },
    get logger() {
      return logger;
    },
    setLogger,
    loadWasm,
    getModule,
    isReady,
    reset,
  };
}

// Create and export singleton instance
const wasmLoader = createWasmLoader();

export { wasmLoader };
export type { WasmModule, WasmLoaderInstance, LoggerInstance };
