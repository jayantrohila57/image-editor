// WebAssembly Image Processing Worker
// Enhanced worker with comprehensive error handling and debugging

import Module from "./image.js";

let mod = null;
let _isInitialized = false;

// Load WebAssembly module
async function loadWasm() {
  try {
    console.log("[WORKER] Initializing WebAssembly via image.js wrapper...");

    mod = await Module({
      locateFile: (path) => {
        if (path.endsWith(".wasm")) {
          console.log("[WORKER] Redirecting WASM load to /wasm/image.wasm");
          return "/wasm/image.wasm";
        }
        return path;
      },
    });

    _isInitialized = true;
    console.log("[WORKER] WebAssembly module initialized successfully");
    return true;
  } catch (error) {
    console.error("[WORKER] Failed to initialize WebAssembly module:", error);
    _isInitialized = false;
    return false;
  }
}

// Process image data with WebAssembly
function processImage(buffer, type, value, job) {
  try {
    if (!mod) {
      throw new Error("WebAssembly module not loaded");
    }

    console.log(
      `[WORKER] Processing ${type} filter (val: ${value}) for job ${job}`,
    );

    const size = buffer.byteLength;
    const ptr = mod._malloc(size);
    mod.HEAPU8.set(new Uint8Array(buffer), ptr);

    // Call the specific WASM function
    const fnName = `_${type}`;
    if (typeof mod[fnName] !== "function") {
      throw new Error(`WASM function ${fnName} not found`);
    }

    mod[fnName](ptr, size, value);

    const out = mod.HEAPU8.slice(ptr, ptr + size);
    mod._free(ptr);

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
      error: error.message || "Unknown error occurred",
    };
  }
}

// Handle messages from main thread
self.onmessage = async (e) => {
  console.log("[WORKER] Received message:", e.data);

  const { type, buffer, value, job, prevAmount, currentAmount } = e.data;

  try {
    switch (type) {
      case "init": {
        console.log("[WORKER] Initializing...");
        const success = await loadWasm();
        self.postMessage({
          success,
          type: "init",
          job,
          error: success ? null : "Failed to initialize WebAssembly",
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

// Handle worker errors
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

console.log("[WORKER] Enhanced WebAssembly worker initialized");
