"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import type {
  ClassModule,
  ModuleContext,
  ModulePageProps,
} from "@/lib/modules/sdk";

class ModuleErrorBoundary extends Component<
  {
    moduleName: string;
    children: ReactNode;
    onError: (message: string) => void;
  },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError(`${error.message}\n${info.componentStack || ""}`);
  }

  render() {
    if (this.state.error) {
      return (
        <section className="card rounded-[24px] p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <AlertTriangle size={22} />
          </div>
          <h2 className="mt-4 font-extrabold">
            {this.props.moduleName}暂时无法运行
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            模块错误已被隔离，班级空间的其他功能不会受到影响。
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
          >
            <RotateCcw size={15} />
            重试模块
          </button>
        </section>
      );
    }
    return this.props.children;
  }
}

export function ModuleSurface({
  module,
  context,
  settings,
  surface,
  onError,
}: {
  module: ClassModule;
  context: ModuleContext;
  settings: Record<string, unknown>;
  surface: "page" | "widget";
  onError: (message: string) => void;
}) {
  const ComponentToRender =
    surface === "widget" ? module.HomeWidget : module.Page;
  if (!ComponentToRender) return null;
  const props: ModulePageProps = { context, settings };

  return (
    <ModuleErrorBoundary
      moduleName={module.manifest.name}
      onError={onError}
    >
      <ComponentToRender {...props} />
    </ModuleErrorBoundary>
  );
}
