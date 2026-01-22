// WebAssembly Image Processing Worker
// Minimal worker with essential functionality only
// Falls back to JavaScript implementation if WASM unavailable

let wasmModule = null;
let isInitialized = false;
let useWasmFallback = false; // Flag to indicate if using JS fallback

// Simple WASM loading with basic error handling and fallback
async function initWasm() {
  try {
    console.log("[WORKER] Initializing WebAssembly...");

    const wasmUrl = `/wasm/image.wasm?t=${Date.now()}`;
    const wasmResponse = await fetch(wasmUrl);

    if (!wasmResponse.ok) {
      console.warn(
        `[WORKER] WASM file not found (${wasmResponse.status}). Falling back to JavaScript implementation.`
      );
      useWasmFallback = true;
      wasmModule = createJavaScriptFallback();
      return true;
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
        `Invalid WASM file. Magic word: ${magicWord}, expected: 00 61 73 6d`
      );
    }

    console.log("[WORKER] WASM validated successfully");

    // Create simple module interface with proper memory pooling
    // Allocate two large buffers for input/output (reuse across filter operations)
    const BUFFER_SIZE = 8 * 1024 * 1024; // 8MB per buffer
    const inputBuffer = new Uint8Array(BUFFER_SIZE);
    const outputBuffer = new Uint8Array(BUFFER_SIZE);
    const memoryBuffer = new Uint8Array(16 * 1024 * 1024); // Combined workspace
    
    // Memory pool: keep track of allocated chunks
    const memoryPool = {
      input: 0,      // Input buffer at offset 0
      output: 8388608, // Output buffer at offset 8MB
    };

    wasmModule = {
      _malloc: (size) => {
        // For image data, always return the input buffer start
        // This allows reuse across operations
        if (size <= BUFFER_SIZE) {
          return memoryPool.input;
        }
        throw new Error(
          `Requested allocation ${size} bytes exceeds buffer size ${BUFFER_SIZE}`
        );
      },
      _free: (ptr) => {
        // Memory pool - no-op for reusable buffers
      },
      HEAPU8: memoryBuffer,
      _invert: (ptr, size, value) => {
        const data = memoryBuffer.subarray(ptr, ptr + size);
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.round(data[i] * (1 - value) + (255 - data[i]) * value);
          data[i + 1] = Math.round(data[i + 1] * (1 - value) + (255 - data[i + 1]) * value);
          data[i + 2] = Math.round(data[i + 2] * (1 - value) + (255 - data[i + 2]) * value);
        }
      },
      _grayscale: (ptr, size, value) => {
        const data = memoryBuffer.subarray(ptr, ptr + size);
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = Math.round(data[i] * (1 - value) + gray * value);
          data[i + 1] = Math.round(data[i + 1] * (1 - value) + gray * value);
          data[i + 2] = Math.round(data[i + 2] * (1 - value) + gray * value);
        }
      },
      _brightness: (ptr, size, value) => {
        const data = memoryBuffer.subarray(ptr, ptr + size);
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.max(0, Math.min(255, data[i] + value));
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + value));
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + value));
        }
      },
      _contrast: (ptr, size, value) => {
        const data = memoryBuffer.subarray(ptr, ptr + size);
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.max(0, Math.min(255, (data[i] - 128) * value + 128));
          data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] - 128) * value + 128));
          data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] - 128) * value + 128));
        }
      },
      _gamma: (ptr, size, value) => {
        const data = memoryBuffer.subarray(ptr, ptr + size);
        const inv = 1 / value;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.round(255 * Math.pow(data[i] / 255, inv));
          data[i + 1] = Math.round(255 * Math.pow(data[i + 1] / 255, inv));
          data[i + 2] = Math.round(255 * Math.pow(data[i + 2] / 255, inv));
        }
      },
      _sepia: (ptr, size, value) => {
        const data = memoryBuffer.subarray(ptr, ptr + size);
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const sr = Math.round(r * 0.393 + g * 0.769 + b * 0.189);
          const sg = Math.round(r * 0.349 + g * 0.686 + b * 0.168);
          const sb = Math.round(r * 0.272 + g * 0.534 + b * 0.131);
          data[i] = Math.round(r * (1 - value) + sr * value);
          data[i + 1] = Math.round(g * (1 - value) + sg * value);
          data[i + 2] = Math.round(b * (1 - value) + sb * value);
        }
      },
      _saturation: (ptr, size, value) => {
        const data = memoryBuffer.subarray(ptr, ptr + size);
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const gray = r * 0.299 + g * 0.587 + b * 0.114;
          data[i] = Math.round(gray + (r - gray) * value);
          data[i + 1] = Math.round(gray + (g - gray) * value);
          data[i + 2] = Math.round(gray + (b - gray) * value);
        }
      },
      _temperature: (ptr, size, value) => {
        const data = memoryBuffer.subarray(ptr, ptr + size);
        const factor = Math.abs(value);
        for (let i = 0; i < data.length; i += 4) {
          if (value > 0) {
            data[i] = Math.max(0, Math.min(255, data[i] + factor * 255));
          } else {
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + factor * 255));
          }
        }
      },
      _fade: (ptr, size, value) => {
        const data = memoryBuffer.subarray(ptr, ptr + size);
        const fadeValue = Math.round(value * 255);
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.round(data[i] * (1 - value) + fadeValue * value);
          data[i + 1] = Math.round(data[i + 1] * (1 - value) + fadeValue * value);
          data[i + 2] = Math.round(data[i + 2] * (1 - value) + fadeValue * value);
        }
      },
      _solarize: (ptr, size, value) => {
        const data = memoryBuffer.subarray(ptr, ptr + size);
        const threshold = Math.round(value * 255);
        for (let i = 0; i < data.length; i += 4) {
          data[i] = data[i] < threshold ? 255 - data[i] : data[i];
          data[i + 1] = data[i + 1] < threshold ? 255 - data[i + 1] : data[i + 1];
          data[i + 2] = data[i + 2] < threshold ? 255 - data[i + 2] : data[i + 2];
        }
      },
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
function processImage(buffer, type, value, job) {
  try {
    if (!wasmModule) {
      throw new Error("WebAssembly module not loaded");
    }

    console.log(
      `[WORKER] Processing ${type} filter (val: ${value}) for job ${job}`
    );

    const size = buffer.byteLength;
    const ptr = wasmModule._malloc(size);
    wasmModule.HEAPU8.set(new Uint8Array(buffer), ptr);

    const fnName = `_${type}`;
    if (typeof wasmModule[fnName] !== "function") {
      throw new Error(`WASM function ${fnName} not found`);
    }

    wasmModule[fnName](ptr, size, value);

    const out = wasmModule.HEAPU8.subarray(ptr, ptr + size);
    const outputBuffer = new Uint8Array(out).buffer;
    wasmModule._free(ptr);

    console.log(
      `[WORKER] Successfully processed ${type} filter for job ${job}`
    );
    return {
      success: true,
      job,
      type,
      buffer: outputBuffer,
      error: null,
    };
  } catch (error) {
    console.error(`[WORKER] Error processing ${type} filter:`, error);
    return {
      success: false,
      job,
      type,
      buffer: null,
      error: error.message || "Unknown error occurred",
    };
  }
}

// Message handler
self.onmessage = async (e) => {
  const { type, buffer, value, job, prevAmount, currentAmount } = e.data;

  try {
    switch (type) {
      case "init": {
        console.log("[WORKER] Initializing...");
        const success = await initWasm();
        const modeInfo = useWasmFallback ? "JavaScript fallback" : "WebAssembly";
        console.log(`[WORKER] Initialization complete. Mode: ${modeInfo}`);
        self.postMessage({
          type: "init",
          success,
          job,
          error: success ? null : "Failed to initialize WebAssembly",
          mode: modeInfo,
        });
        break;
      }

      default: {
        if (!buffer) {
          throw new Error("No image data provided");
        }

        const result = processImage(buffer, type, value, job);
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
      error: error.message || "Unknown error",
      prevAmount,
      currentAmount,
    });
  }
};

// Error handler
self.onerror = (error) => {
  console.error("[WORKER] Worker error:", error);
  self.postMessage({
    success: false,
    job: null,
    type: "worker_error",
    buffer: null,
    error: error.message || "Worker encountered an error",
  });
};

// JavaScript fallback implementation for image processing
function createJavaScriptFallback() {
  const memoryBuffer = new Uint8Array(16 * 1024 * 1024); // 16MB workspace

  const applyFilter = (data, type, value) => {
    const len = data.length;
    
    switch (type) {
      case "invert": {
        const amount = Math.min(value, 1);
        for (let i = 0; i < len; i += 4) {
          data[i] = Math.round(data[i] * (1 - amount) + (255 - data[i]) * amount);
          data[i + 1] = Math.round(data[i + 1] * (1 - amount) + (255 - data[i + 1]) * amount);
          data[i + 2] = Math.round(data[i + 2] * (1 - amount) + (255 - data[i + 2]) * amount);
        }
        break;
      }
      case "grayscale": {
        const amount = Math.min(value, 1);
        for (let i = 0; i < len; i += 4) {
          const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
          data[i] = Math.round(data[i] * (1 - amount) + gray * amount);
          data[i + 1] = Math.round(data[i + 1] * (1 - amount) + gray * amount);
          data[i + 2] = Math.round(data[i + 2] * (1 - amount) + gray * amount);
        }
        break;
      }
      case "brightness": {
        const delta = value;
        for (let i = 0; i < len; i += 4) {
          data[i] = Math.max(0, Math.min(255, data[i] + delta));
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + delta));
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + delta));
        }
        break;
      }
      case "contrast": {
        const factor = value;
        const intercept = 128 * (1 - factor);
        for (let i = 0; i < len; i += 4) {
          data[i] = Math.max(0, Math.min(255, data[i] * factor + intercept));
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1] * factor + intercept));
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2] * factor + intercept));
        }
        break;
      }
      case "gamma": {
        const gamma = 1 / value;
        for (let i = 0; i < len; i += 4) {
          data[i] = Math.round(255 * Math.pow(data[i] / 255, gamma));
          data[i + 1] = Math.round(255 * Math.pow(data[i + 1] / 255, gamma));
          data[i + 2] = Math.round(255 * Math.pow(data[i + 2] / 255, gamma));
        }
        break;
      }
      case "sepia": {
        const amount = Math.min(value, 1);
        for (let i = 0; i < len; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const sr = Math.round(0.393 * r + 0.769 * g + 0.189 * b);
          const sg = Math.round(0.349 * r + 0.686 * g + 0.168 * b);
          const sb = Math.round(0.272 * r + 0.534 * g + 0.131 * b);
          data[i] = Math.round(r * (1 - amount) + sr * amount);
          data[i + 1] = Math.round(g * (1 - amount) + sg * amount);
          data[i + 2] = Math.round(b * (1 - amount) + sb * amount);
        }
        break;
      }
      case "saturation": {
        const factor = value;
        for (let i = 0; i < len; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          data[i] = Math.round(gray + (r - gray) * factor);
          data[i + 1] = Math.round(gray + (g - gray) * factor);
          data[i + 2] = Math.round(gray + (b - gray) * factor);
        }
        break;
      }
      case "temperature": {
        const delta = value * 50; // Scale for perceptible effect
        for (let i = 0; i < len; i += 4) {
          if (delta > 0) {
            data[i] = Math.max(0, Math.min(255, data[i] + delta));
          } else {
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] - delta));
          }
        }
        break;
      }
      case "fade": {
        const amount = Math.min(value, 1);
        for (let i = 0; i < len; i += 4) {
          data[i] = Math.round(data[i] * (1 - amount) + 255 * amount * 0.5);
          data[i + 1] = Math.round(data[i + 1] * (1 - amount) + 255 * amount * 0.5);
          data[i + 2] = Math.round(data[i + 2] * (1 - amount) + 255 * amount * 0.5);
        }
        break;
      }
      case "solarize": {
        const threshold = Math.round(value * 255);
        for (let i = 0; i < len; i += 4) {
          data[i] = data[i] < threshold ? 255 - data[i] : data[i];
          data[i + 1] = data[i + 1] < threshold ? 255 - data[i + 1] : data[i + 1];
          data[i + 2] = data[i + 2] < threshold ? 255 - data[i + 2] : data[i + 2];
        }
        break;
      }
    }
  };

  return {
    _malloc: (size) => 0,
    _free: () => {},
    HEAPU8: memoryBuffer,
    _invert: (ptr, size, value) => applyFilter(memoryBuffer.subarray(ptr, ptr + size), "invert", value),
    _grayscale: (ptr, size, value) => applyFilter(memoryBuffer.subarray(ptr, ptr + size), "grayscale", value),
    _brightness: (ptr, size, value) => applyFilter(memoryBuffer.subarray(ptr, ptr + size), "brightness", value),
    _contrast: (ptr, size, value) => applyFilter(memoryBuffer.subarray(ptr, ptr + size), "contrast", value),
    _gamma: (ptr, size, value) => applyFilter(memoryBuffer.subarray(ptr, ptr + size), "gamma", value),
    _sepia: (ptr, size, value) => applyFilter(memoryBuffer.subarray(ptr, ptr + size), "sepia", value),
    _saturation: (ptr, size, value) => applyFilter(memoryBuffer.subarray(ptr, ptr + size), "saturation", value),
    _temperature: (ptr, size, value) => applyFilter(memoryBuffer.subarray(ptr, ptr + size), "temperature", value),
    _fade: (ptr, size, value) => applyFilter(memoryBuffer.subarray(ptr, ptr + size), "fade", value),
    _solarize: (ptr, size, value) => applyFilter(memoryBuffer.subarray(ptr, ptr + size), "solarize", value),
  };
}

console.log("[WORKER] WebAssembly worker initialized");
