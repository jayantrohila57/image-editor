"use client";

import { useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

  function getWorker() {
    if (!workerRef.current) {
      workerRef.current = new Worker("/wasm/worker.js", { type: "module" });
    }
    return workerRef.current;
  }

  function load(file: File) {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const c = canvasRef.current!;
      const ctx = c.getContext("2d")!;
      c.width = img.width;
      c.height = img.height;
      ctx.drawImage(img, 0, 0);

      const base = ctx.getImageData(0, 0, img.width, img.height);
      baseImage.current = base;

      setValues(defaultValues);
      setDirty(false);
      setReady(true);

      ctx.putImageData(base, 0, 0);
    };
  }

  function applyAll(v: Record<string, number>) {
    if (!baseImage.current) return;

    const job = ++renderId.current;

    const src = baseImage.current;
    const img = new ImageData(
      new Uint8ClampedArray(src.data),
      src.width,
      src.height,
    );

    const worker = getWorker();
    let i = 0;

    const run = () => {
      const f = filters[i++];
      if (!f) {
        if (job === renderId.current) {
          canvasRef.current!.getContext("2d")!.putImageData(img, 0, 0);
        }
        return;
      }

      const amount = v[f.key];
      if (amount === f.default) {
        run();
        return;
      }

      worker.postMessage({
        buffer: img.data.slice().buffer,
        type: f.key,
        value: amount,
        job,
      });

      worker.onmessage = (e) => {
        if (e.data.job !== job) return;
        img.data.set(new Uint8Array(e.data.buffer));
        run();
      };
    };

    run();
  }

  return (
    <div className="h-screen grid grid-cols-[1fr_360px] bg-background text-foreground">
      {/* Canvas */}
      <div className="flex flex-col items-center justify-center bg-background p-8">
        {!ready && (
          <div className="w-full max-w-md space-y-4">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => e.target.files && load(e.target.files[0])}
              />
              <Button className="w-full h-12 text-base font-medium">
                Choose Image
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Select an image to start editing
            </p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className={`max-w-full max-h-full border border-border rounded-lg shadow-lg ${ready ? "mt-8" : ""}`}
        />
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
                  disabled={!ready}
                  onValueChange={([v]) => {
                    const next = { ...values, [f.key]: v };
                    setValues(next);
                    setDirty(true);
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
            disabled={!ready || !dirty}
            onClick={() => {
              setValues(defaultValues);
              setDirty(false);
              applyAll(defaultValues);
            }}
          >
            Reset All
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
