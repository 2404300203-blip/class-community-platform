"use client";

import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  GitPullRequest,
  LockKeyhole,
  PackageCheck,
  RotateCcw,
  Settings2,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useState } from "react";
import type { ClassModule } from "@/lib/modules/sdk";
import {
  getModuleDefaults,
  mergeModuleSettings,
} from "@/lib/modules/sdk";
import type { ModuleInstallState, User } from "@/lib/types";
import { ModuleIcon } from "./module-icon";

const permissionLabels = {
  "read:classroom": "读取班级公开信息",
  "read:current-user": "读取当前用户",
  "storage:module": "使用模块独立存储",
  "storage:shared": "使用班级共享存储",
};

export function ModuleCenter({
  modules,
  states,
  currentUser,
  onChange,
  onOpen,
}: {
  modules: ClassModule[];
  states: Record<string, ModuleInstallState>;
  currentUser: User;
  onChange: (moduleId: string, state: ModuleInstallState) => void;
  onOpen: (moduleId: string) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const isMaintainer = currentUser.role === "maintainer";

  function getState(module: ClassModule) {
    return (
      states[module.manifest.id] || {
        moduleId: module.manifest.id,
        enabled: false,
        installedVersion: module.manifest.version,
        config: getModuleDefaults(module.manifest),
        status: "ready" as const,
      }
    );
  }

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[28px] bg-[#5556dc] p-6 text-white sm:p-8">
        <div className="soft-grid absolute inset-0 opacity-40" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-300/30 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-100">
            <PackageCheck size={16} />
            CLASS MODULE PLATFORM
          </div>
          <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">
            把专业技能，变成班级的新功能。
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100">
            同学使用 TypeScript SDK 开发模块，通过 Git 提交代码。模块经过维护者审核后，可以在这里启用和配置。
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs">
              <GitPullRequest size={13} /> Git 审核发布
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs">
              <ShieldCheck size={13} /> 权限受控
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs">
              <LockKeyhole size={13} /> 数据隔离
            </span>
          </div>
        </div>
      </section>

      {!isMaintainer && (
        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <LockKeyhole size={18} className="mt-0.5 shrink-0" />
          <p className="leading-6">
            你正在以普通成员身份查看。模块启停和配置由班级维护者负责，所有同学都可以通过 Git 提交新模块。
          </p>
        </div>
      )}

      <div className="space-y-4">
        {modules.map((module) => {
          const state = getState(module);
          const settings = mergeModuleSettings(
            module.manifest,
            state.config,
          );
          const isExpanded = expanded === module.manifest.id;

          return (
            <article
              key={module.manifest.id}
              className="card overflow-hidden rounded-[24px]"
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <ModuleIcon name={module.manifest.icon} size={21} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold">
                        {module.manifest.name}
                      </h3>
                      <span
                        className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
                          state.status === "error"
                            ? "bg-rose-50 text-rose-600"
                            : state.enabled
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {state.status === "error" ? (
                          <AlertCircle size={11} />
                        ) : state.enabled ? (
                          <CheckCircle2 size={11} />
                        ) : (
                          <ToggleLeft size={11} />
                        )}
                        {state.status === "error"
                          ? "运行异常"
                          : state.enabled
                            ? "已启用"
                            : "已停用"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {module.manifest.author} · v
                      {state.installedVersion}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {module.manifest.description}
                    </p>
                  </div>
                </div>

                {state.error && (
                  <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-xs leading-5 text-rose-600">
                    {state.error.split("\n")[0]}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => onOpen(module.manifest.id)}
                    disabled={!state.enabled}
                    className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    打开模块
                  </button>
                  <button
                    onClick={() =>
                      setExpanded(isExpanded ? null : module.manifest.id)
                    }
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
                  >
                    <Settings2 size={14} />
                    详情与配置
                    {isExpanded ? (
                      <ChevronUp size={13} />
                    ) : (
                      <ChevronDown size={13} />
                    )}
                  </button>
                  {isMaintainer && (
                    <>
                      {state.installedVersion !== module.manifest.version && (
                        <button
                          onClick={() =>
                            onChange(module.manifest.id, {
                              ...state,
                              installedVersion: module.manifest.version,
                              config: {
                                ...getModuleDefaults(module.manifest),
                                ...state.config,
                              },
                              status: "ready",
                              error: undefined,
                              rollback: {
                                version: state.installedVersion,
                                config: state.config,
                              },
                            })
                          }
                          className="ml-auto rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700"
                        >
                          升级到 v{module.manifest.version}
                        </button>
                      )}
                      <button
                        onClick={() =>
                          onChange(module.manifest.id, {
                            ...state,
                            enabled: !state.enabled,
                            status: "ready",
                            error: undefined,
                          })
                        }
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold ${
                          state.installedVersion === module.manifest.version
                            ? "ml-auto"
                            : ""
                        } ${
                          state.enabled
                            ? "bg-slate-100 text-slate-600"
                            : "bg-indigo-50 text-indigo-700"
                        }`}
                      >
                        {state.enabled ? (
                          <ToggleRight size={17} />
                        ) : (
                          <ToggleLeft size={17} />
                        )}
                        {state.enabled ? "停用" : "启用"}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6">
                  <div>
                    <h4 className="text-xs font-extrabold">申请的权限</h4>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {module.manifest.permissions.map((permission) => (
                        <span
                          key={permission}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-600"
                        >
                          {permissionLabels[permission]}
                        </span>
                      ))}
                    </div>
                  </div>

                  {module.manifest.settingsSchema.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <h4 className="text-xs font-extrabold">模块配置</h4>
                      {module.manifest.settingsSchema.map((field) => (
                        <label
                          key={field.key}
                          className="flex items-center justify-between gap-5 rounded-xl border border-slate-200 bg-white p-4"
                        >
                          <span>
                            <span className="block text-sm font-semibold">
                              {field.label}
                            </span>
                            {field.description && (
                              <span className="mt-1 block text-xs leading-5 text-slate-400">
                                {field.description}
                              </span>
                            )}
                          </span>
                          {field.type === "boolean" ? (
                            <button
                              type="button"
                              disabled={!isMaintainer}
                              onClick={() =>
                                onChange(module.manifest.id, {
                                  ...state,
                                  config: {
                                    ...settings,
                                    [field.key]: !settings[field.key],
                                  },
                                })
                              }
                              className={`shrink-0 ${
                                settings[field.key]
                                  ? "text-indigo-600"
                                  : "text-slate-300"
                              } disabled:cursor-not-allowed`}
                              aria-label={`切换${field.label}`}
                            >
                              {settings[field.key] ? (
                                <ToggleRight size={30} />
                              ) : (
                                <ToggleLeft size={30} />
                              )}
                            </button>
                          ) : field.type === "select" ? (
                            <select
                              value={String(settings[field.key])}
                              disabled={!isMaintainer}
                              onChange={(event) =>
                                onChange(module.manifest.id, {
                                  ...state,
                                  config: {
                                    ...settings,
                                    [field.key]: event.target.value,
                                  },
                                })
                              }
                              className="h-10 shrink-0 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none disabled:text-slate-400"
                            >
                              {field.options?.map((option) => (
                                <option
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              value={String(settings[field.key])}
                              disabled={!isMaintainer}
                              onChange={(event) =>
                                onChange(module.manifest.id, {
                                  ...state,
                                  config: {
                                    ...settings,
                                    [field.key]: event.target.value,
                                  },
                                })
                              }
                              className="h-10 w-36 rounded-xl border border-slate-200 px-3 text-xs outline-none"
                            />
                          )}
                        </label>
                      ))}
                    </div>
                  )}

                  {isMaintainer && state.rollback && (
                    <button
                      onClick={() =>
                        onChange(module.manifest.id, {
                          ...state,
                          installedVersion: state.rollback!.version,
                          config: state.rollback!.config,
                          enabled: false,
                          status: "ready",
                          error: undefined,
                          rollback: undefined,
                        })
                      }
                      className="mt-5 flex items-center gap-2 text-xs font-semibold text-amber-700"
                    >
                      <RotateCcw size={14} />
                      回滚到 v{state.rollback.version} 配置快照并停用
                    </button>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
