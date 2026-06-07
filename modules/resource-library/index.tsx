"use client";

import {
  ArrowRight,
  BookMarked,
  ExternalLink,
  FileText,
  Link2,
  Plus,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import type {
  ClassModule,
  ModulePageProps,
  ModuleWidgetProps,
} from "@/lib/modules/sdk";
import type { ResourceItem } from "@/lib/types";

const resourceTypes: ResourceItem["type"][] = [
  "笔记",
  "试卷",
  "课件",
  "链接",
  "其他",
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
  });
}

function typeClass(type: ResourceItem["type"]) {
  if (type === "笔记") return "bg-indigo-50 text-indigo-700";
  if (type === "试卷") return "bg-rose-50 text-rose-700";
  if (type === "课件") return "bg-sky-50 text-sky-700";
  if (type === "链接") return "bg-emerald-50 text-emerald-700";
  return "bg-slate-100 text-slate-600";
}

function ResourceLibraryPage({ context }: ModulePageProps) {
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState<ResourceItem["type"]>("笔记");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");
  const resources = [...context.resources].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return resources;
    return resources.filter((item) =>
      [
        item.title,
        item.subject,
        item.type,
        item.description,
        item.authorName,
        item.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [query, resources]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (title.trim().length < 2) {
      setError("请填写资料标题");
      return;
    }
    if (!subject.trim()) {
      setError("请填写学科或方向");
      return;
    }
    if (description.trim().length < 5) {
      setError("请简单说明这份资料适合怎么用");
      return;
    }

    await context.addResource({
      title: title.trim(),
      subject: subject.trim(),
      type,
      url: url.trim(),
      description: description.trim(),
      tags: tags
        .split(/[,，\s]+/)
        .map((tag) => tag.replace(/^#/, "").trim())
        .filter(Boolean)
        .slice(0, 5),
    });

    setTitle("");
    setSubject("");
    setType("笔记");
    setUrl("");
    setDescription("");
    setTags("");
    setError("");
    setShowForm(false);
    context.notify("资料已分享到班级资料库");
  }

  async function remove(resource: ResourceItem) {
    if (resource.authorId !== context.currentUser.id) {
      context.notify("只能删除自己分享的资料");
      return;
    }
    await context.removeResource(resource.id);
    context.notify("资料已删除");
  }

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[28px] bg-[#1f7a5a] p-6 text-white sm:p-8">
        <div className="soft-grid absolute inset-0 opacity-30" />
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-100">
              <BookMarked size={15} />
              CLASS MODULE · RESOURCE LIBRARY
            </div>
            <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">
              把好资料放到同一个地方。
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50">
              每位同学都可以分享笔记、试卷、课件和学习链接。资料会保存在班级共享库里，方便大家一起补齐知识地图。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs">
                已收录 {resources.length} 份
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs">
                {context.classroom.name}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowForm((value) => !value)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#1f7a5a] shadow-sm"
          >
            <Plus size={16} />
            分享资料
          </button>
        </div>
      </section>

      {showForm && (
        <section className="card rounded-[24px] p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-emerald-600" />
            <h3 className="font-extrabold">分享学习资料</h3>
          </div>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-semibold">资料标题</span>
                <input
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setError("");
                  }}
                  placeholder="例如：线性代数期末复习提纲"
                  className="h-12 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-emerald-400"
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold">学科/方向</span>
                <input
                  value={subject}
                  onChange={(event) => {
                    setSubject(event.target.value);
                    setError("");
                  }}
                  placeholder="例如：线性代数"
                  className="h-12 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-emerald-400"
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
              <label>
                <span className="mb-2 block text-sm font-semibold">资料类型</span>
                <select
                  value={type}
                  onChange={(event) =>
                    setType(event.target.value as ResourceItem["type"])
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-emerald-400"
                >
                  {resourceTypes.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold">
                  资料链接
                </span>
                <input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="可选，粘贴网盘、文档或网页链接"
                  className="h-12 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-emerald-400"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">使用说明</span>
              <textarea
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                  setError("");
                }}
                rows={4}
                maxLength={240}
                placeholder="这份资料适合什么时候看？重点在哪里？"
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/60 p-4 leading-7 outline-none focus:border-emerald-400 focus:bg-white"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">标签</span>
              <input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="用空格或逗号分隔，例如：期末 重点题"
                className="h-12 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-emerald-400"
              />
            </label>
            {error && (
              <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600"
              >
                取消
              </button>
              <button className="h-11 flex-[2] rounded-xl bg-[#1f7a5a] text-sm font-semibold text-white">
                发布到资料库
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="card flex items-center gap-3 rounded-[20px] px-4 py-3">
        <Search size={17} className="text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索标题、学科、标签或分享人"
          className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((resource) => {
          const canDelete = resource.authorId === context.currentUser.id;
          return (
            <article key={resource.id} className="card rounded-[24px] p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  {resource.url ? <Link2 size={20} /> : <FileText size={20} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold">{resource.title}</h3>
                    <span
                      className={`rounded-lg px-2 py-1 text-[10px] font-semibold ${typeClass(
                        resource.type,
                      )}`}
                    >
                      {resource.type}
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                      {resource.subject}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {resource.description}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <UserRound size={13} />
                      {resource.authorName}
                    </span>
                    <span>{formatDate(resource.createdAt)}</span>
                    {resource.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-emerald-50 px-2 py-1 font-medium text-emerald-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#1f7a5a] px-4 py-2 text-xs font-semibold text-white"
                      >
                        打开资料
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => remove(resource)}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600"
                      >
                        <Trash2 size={14} />
                        删除
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
        {!filtered.length && (
          <section className="card rounded-[24px] px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <BookMarked size={24} />
            </div>
            <h3 className="mt-4 font-extrabold">还没有找到资料</h3>
            <p className="mt-2 text-sm text-slate-500">
              换个关键词，或者分享第一份相关资料。
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

function ResourceLibraryWidget({ context }: ModuleWidgetProps) {
  const resources = [...context.resources].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const latest = resources[0];

  return (
    <section className="card rounded-[24px] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <BookMarked size={16} />
          </span>
          <div>
            <p className="text-xs font-extrabold">班级资料库</p>
            <p className="text-[10px] text-slate-400">
              已收录 {resources.length} 份资料
            </p>
          </div>
        </div>
        <button
          onClick={() => context.navigate("module:resource-library")}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-700"
        >
          去分享 <ArrowRight size={14} />
        </button>
      </div>
      {latest && (
        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <span
            className={`rounded-lg px-2 py-1 text-[10px] font-semibold ${typeClass(
              latest.type,
            )}`}
          >
            {latest.type}
          </span>
          <h3 className="mt-3 text-sm font-extrabold">{latest.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
            {latest.subject} · {latest.authorName}
          </p>
        </div>
      )}
    </section>
  );
}

const resourceLibrary: ClassModule = {
  manifest: {
    id: "resource-library",
    name: "资料库",
    description: "班级共享学习资料，支持同学发布笔记、课件、试卷和链接。",
    author: "班级共建小组",
    version: "1.0.0",
    icon: "library",
    navigation: {
      label: "资料库",
      order: 20,
    },
    permissions: [
      "read:classroom",
      "read:current-user",
      "storage:shared",
    ],
    settingsSchema: [],
  },
  Page: ResourceLibraryPage,
  HomeWidget: ResourceLibraryWidget,
};

export default resourceLibrary;
