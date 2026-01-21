// WebAssembly Image Processing Worker
// Enhanced worker with comprehensive error handling and debugging

let wasmModule = null;
let _isInitialized = false;

// Load WebAssembly module
async function loadWasm() {
  try {
    console.log("[WORKER] Loading WebAssembly module...");

    // Import the WebAssembly module
    const wasmUrl = new URL("image.wasm", import.meta.url);
    const { default: wasmFunctions } = await import(wasmUrl);

    wasmModule = wasmFunctions;
    _isInitialized = true;
    console.log("[WORKER] WebAssembly module loaded successfully");
    return true;
  } catch (error) {
    console.error("[WORKER] Failed to load WebAssembly module:", error);
    _isInitialized = false;
    return false;
  }
}

// Process image data with WebAssembly
function processImage(data, type, value, job) {
  try {
    if (!wasmModule) {
      throw new Error("WebAssembly module not loaded");
    }

    console.log(
      `[WORKER] Processing ${type} filter with value ${value} for job ${job}`,
    );

    const buffer = new Uint8Array(data);
    const result = wasmModule[type](buffer, buffer.length, value);

    if (result) {
      console.log(`[WORKER] Successfully processed ${type} filter`);
      return {
        success: true,
        job,
        type,
        buffer: result.buffer,
        error: null,
      };
    } else {
      throw new Error(`Failed to apply ${type} filter`);
    }
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
