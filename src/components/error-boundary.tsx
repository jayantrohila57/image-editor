"use client";

import { AlertCircle, RefreshCcw } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `[ErrorBoundary] [${this.props.name || "Global"}] caught error:`,
      error,
      errorInfo,
    );
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center p-6 h-full w-full">
          <Card className="w-full max-w-md border-destructive/50 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertCircle className="h-6 w-6" />
                <CardTitle>Component Error</CardTitle>
              </div>
              <CardDescription>
                Something went wrong in the{" "}
                <strong>{this.props.name || "UI"}</strong> layer.
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-destructive/5 p-4 rounded-md mx-6 mb-6">
              <p className="text-xs font-mono text-destructive break-words">
                {this.state.error?.message || "Unknown error"}
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Try to re-render
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
