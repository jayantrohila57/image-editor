"use client";

import { Editor } from "@/components/editor-components";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/sonner";
import { ImageEditorProvider } from "@/lib/image-context";

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
