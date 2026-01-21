"use client";

import { ImageEditorProvider } from "@/lib/image-context";
import { Editor } from "@/components/editor-components";
import { Toaster } from "@/components/ui/sonner";

import { ErrorBoundary } from "@/components/error-boundary";

export default function Page() {
  return (
    <ImageEditorProvider>
      <ErrorBoundary name="Global App">
        <Editor>
          <Editor.Canvas />
          <Editor.Sidebar>
            <Editor.Filters />
            <Editor.Actions />
          </Editor.Sidebar>
        </Editor>
      </ErrorBoundary>
      <Toaster />
    </ImageEditorProvider>
  );
}
