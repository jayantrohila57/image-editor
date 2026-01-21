import Module from "./image.js";

let mod = null;
let queue = [];

Module().then((m) => {
  mod = m;
  queue.forEach(run);
  queue = [];
});

function run({ buffer, type, value, job }) {
  const size = buffer.byteLength;
  const ptr = mod._malloc(size);
  mod.HEAPU8.set(new Uint8Array(buffer), ptr);

  if (type === "invert") mod._invert(ptr, size, value);
  if (type === "grayscale") mod._grayscale(ptr, size, value);
  if (type === "brightness") mod._brightness(ptr, size, value);
  if (type === "contrast") mod._contrast(ptr, size, value);
  if (type === "gamma") mod._gamma(ptr, size, value);
  if (type === "sepia") mod._sepia(ptr, size, value);
  if (type === "saturation") mod._saturation(ptr, size, value);
  if (type === "temperature") mod._temperature(ptr, size, value);
  if (type === "fade") mod._fade(ptr, size, value);
  if (type === "solarize") mod._solarize(ptr, size, value);

  const out = mod.HEAPU8.slice(ptr, ptr + size);
  mod._free(ptr);

  self.postMessage({ buffer: out.buffer, job }, [out.buffer]);
}

self.onmessage = (e) => {
  if (!mod) {
    queue.push(e.data);
    return;
  }
  run(e.data);
};
