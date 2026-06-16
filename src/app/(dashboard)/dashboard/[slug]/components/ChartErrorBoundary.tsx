"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ChartErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in Chart:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="relative overflow-hidden border-white/5 bg-zinc-900/50 backdrop-blur-sm shadow-sm">
          <CardHeader className="pt-8 px-8 pb-4">
            <CardTitle className="text-lg font-semibold tracking-tight text-foreground">Trạng thái tác vụ</CardTitle>
          </CardHeader>
          <CardContent className="flex h-[240px] items-center justify-center text-center px-8 pb-8">
            <div className="space-y-3">
              <AlertCircle className="mx-auto h-10 w-10 text-red-500/20" />
              <p className="text-sm font-medium text-muted-foreground/60">Không thể tải biểu đồ trạng thái tác vụ</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
