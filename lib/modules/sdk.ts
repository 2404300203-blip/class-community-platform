import type { ComponentType } from "react";
import type { Classroom, User } from "@/lib/types";

export type ModuleIcon =
  | "blocks"
  | "braces"
  | "code-2"
  | "folder-git-2"
  | "library"
  | "puzzle"
  | "terminal";

export type ModulePermission =
  | "read:classroom"
  | "read:current-user"
  | "storage:module";

export interface ModuleNavigation {
  label: string;
  order: number;
}

export interface ModuleSettingOption {
  label: string;
  value: string;
}

export interface ModuleSettingField {
  key: string;
  label: string;
  description?: string;
  type: "boolean" | "select" | "text";
  defaultValue: boolean | string;
  options?: ModuleSettingOption[];
}

export interface ClassModuleManifest {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  icon: ModuleIcon;
  navigation: ModuleNavigation;
  permissions: ModulePermission[];
  settingsSchema: ModuleSettingField[];
}

export interface ModuleStorage {
  get<T>(key: string, fallback: T): T;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  subscribe(listener: () => void): () => void;
}

export interface ModuleContext {
  currentUser: Readonly<User>;
  classroom: Readonly<Classroom>;
  storage: ModuleStorage;
  navigate(path: string): void;
  notify(message: string): void;
}

export interface ModulePageProps {
  context: ModuleContext;
  settings: Readonly<Record<string, unknown>>;
}

export type ModuleWidgetProps = ModulePageProps;

export interface ClassModule {
  manifest: ClassModuleManifest;
  Page: ComponentType<ModulePageProps>;
  HomeWidget?: ComponentType<ModuleWidgetProps>;
  setup?: (context: ModuleContext) => void | Promise<void>;
}

export function getModuleDefaults(
  manifest: ClassModuleManifest,
): Record<string, unknown> {
  return Object.fromEntries(
    manifest.settingsSchema.map((field) => [field.key, field.defaultValue]),
  );
}

export function mergeModuleSettings(
  manifest: ClassModuleManifest,
  config: Record<string, unknown>,
) {
  return { ...getModuleDefaults(manifest), ...config };
}
