"use client";

import {
  ArrowRight,
  Check,
  Circle,
  Code2,
  ExternalLink,
  Flame,
  Lightbulb,
  RotateCcw,
  Trophy,
} from "lucide-react";
import type {
  ClassModule,
  ModulePageProps,
  ModuleWidgetProps,
} from "@/lib/modules/sdk";
import { useModuleValue } from "@/lib/modules/use-module-value";

interface Challenge {
  id: string;
  sourceId: string;
  sourceUrl: string;
  title: string;
  difficulty: "简单" | "中等" | "困难";
  description: string;
  tags: string[];
  hint: string;
}

const challenges: Challenge[] = [
  {
    id: "luogu-p1001",
    sourceId: "P1001",
    sourceUrl: "https://www.luogu.com.cn/problem/P1001",
    title: "A+B Problem",
    difficulty: "简单",
    description: "输入两个整数，输出它们的和。从输入、计算和输出开始熟悉在线评测。",
    tags: ["入门", "模拟"],
    hint: "注意只输出答案，不要添加额外提示文字。",
  },
  {
    id: "luogu-p1046",
    sourceId: "P1046",
    sourceUrl: "https://www.luogu.com.cn/problem/P1046",
    title: "陶陶摘苹果",
    difficulty: "中等",
    description: "根据苹果高度和陶陶伸手可达高度，计算她借助板凳能摘到多少苹果。",
    tags: ["模拟", "数组"],
    hint: "逐个判断苹果高度是否不超过伸手高度加上板凳高度。",
  },
  {
    id: "luogu-p1217",
    sourceId: "P1217",
    sourceUrl: "https://www.luogu.com.cn/problem/P1217",
    title: "回文质数",
    difficulty: "困难",
    description: "找出指定范围内所有既是回文数又是质数的整数。",
    tags: ["数论", "质数", "回文"],
    hint: "优先生成回文数，再进行质数判断，可以减少无效枚举。",
  },
];

function getTodayChallenge(difficulty: unknown) {
  const available =
    difficulty && difficulty !== "all"
      ? challenges.filter((item) => item.difficulty === difficulty)
      : challenges;
  const day = new Date().getDate();
  return available[day % available.length] || challenges[0];
}

function difficultyStyle(difficulty: Challenge["difficulty"]) {
  if (difficulty === "简单") return "bg-emerald-50 text-emerald-700";
  if (difficulty === "中等") return "bg-amber-50 text-amber-700";
  return "bg-rose-50 text-rose-700";
}

function AlgorithmPage({ context, settings }: ModulePageProps) {
  const [completed, setCompleted] = useModuleValue<Record<string, boolean>>(
    context.storage,
    "completed",
    {},
  );
  const filtered =
    settings.difficulty && settings.difficulty !== "all"
      ? challenges.filter((item) => item.difficulty === settings.difficulty)
      : challenges;

  function toggle(challenge: Challenge) {
    const next = { ...completed, [challenge.id]: !completed[challenge.id] };
    setCompleted(next);
    context.notify(
      next[challenge.id]
        ? `已完成「${challenge.title}」`
        : `已取消「${challenge.title}」的完成状态`,
    );
  }

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[28px] bg-slate-950 p-6 text-white sm:p-8">
        <div className="soft-grid absolute inset-0 opacity-30" />
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-indigo-500/40 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <Code2 size={15} />
            CLASS MODULE · ALGORITHM
          </div>
          <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">
            每天一道题，把思路写进肌肉记忆。
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
            题目来自洛谷，点击后将在新页面打开官方题目。本站只记录你的自报完成状态，不读取洛谷账号或提交记录。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs">
              已完成 {Object.values(completed).filter(Boolean).length} 题
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs">
              连续挑战 3 天
            </span>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {filtered.map((challenge, index) => {
          const done = Boolean(completed[challenge.id]);
          return (
            <article
              key={challenge.id}
              className={`card rounded-[24px] p-5 transition ${
                done ? "border-emerald-200 bg-emerald-50/40" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${
                    done
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {done ? <Check size={19} /> : index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold">{challenge.title}</h3>
                    <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[10px] font-semibold text-slate-500">
                      {challenge.sourceId}
                    </span>
                    <span
                      className={`rounded-lg px-2 py-1 text-[10px] font-semibold ${difficultyStyle(
                        challenge.difficulty,
                      )}`}
                    >
                      {challenge.difficulty}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {challenge.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {challenge.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {settings.showHints !== false && (
                    <div className="mt-4 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                      <Lightbulb size={15} className="mt-0.5 shrink-0" />
                      {challenge.hint}
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={challenge.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#5b5be8] px-4 py-2 text-xs font-semibold text-white"
                    >
                      去洛谷做题
                      <ExternalLink size={14} />
                    </a>
                    <button
                      onClick={() => toggle(challenge)}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold ${
                        done
                          ? "border border-slate-200 bg-white text-slate-600"
                          : "bg-indigo-50 text-indigo-700"
                      }`}
                    >
                      {done ? <RotateCcw size={14} /> : <Circle size={14} />}
                      {done ? "取消完成" : "标记为已完成"}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function AlgorithmWidget({ context, settings }: ModuleWidgetProps) {
  const [completed] = useModuleValue<Record<string, boolean>>(
    context.storage,
    "completed",
    {},
  );
  const challenge = getTodayChallenge(settings.difficulty);
  const done = Boolean(completed[challenge.id]);

  return (
    <section className="card overflow-hidden rounded-[24px]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-white">
            <Code2 size={16} />
          </span>
          <div>
            <p className="text-xs font-extrabold">今日算法挑战</p>
            <p className="text-[10px] text-slate-400">由算法兴趣小组维护</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-semibold text-orange-500">
          <Flame size={13} fill="currentColor" /> 3 天
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span
              className={`rounded-lg px-2 py-1 text-[10px] font-semibold ${difficultyStyle(
                challenge.difficulty,
              )}`}
            >
              {challenge.difficulty}
            </span>
            <h3 className="mt-3 font-extrabold">{challenge.title}</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              洛谷 {challenge.sourceId} · {challenge.tags.join(" · ")}
            </p>
          </div>
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
              done
                ? "bg-emerald-50 text-emerald-600"
                : "bg-indigo-50 text-indigo-600"
            }`}
          >
            {done ? <Trophy size={20} /> : <Code2 size={20} />}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            班级已有 {done ? 19 : 18} 人完成
          </span>
          <button
            onClick={() => context.navigate("module:algorithm-challenge")}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600"
          >
            {done ? "查看记录" : "开始挑战"} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

const algorithmChallenge: ClassModule = {
  manifest: {
    id: "algorithm-challenge",
    name: "算法挑战",
    description: "精选洛谷题目、个人完成记录与班级挑战概览。",
    author: "算法兴趣小组",
    version: "1.0.0",
    icon: "code-2",
    navigation: {
      label: "算法挑战",
      order: 10,
    },
    permissions: [
      "read:classroom",
      "read:current-user",
      "storage:module",
    ],
    settingsSchema: [
      {
        key: "difficulty",
        label: "默认难度",
        description: "控制模块默认展示的题目难度。",
        type: "select",
        defaultValue: "all",
        options: [
          { label: "全部难度", value: "all" },
          { label: "简单", value: "简单" },
          { label: "中等", value: "中等" },
          { label: "困难", value: "困难" },
        ],
      },
      {
        key: "showHints",
        label: "显示解题提示",
        description: "在题目下方展示不包含完整答案的思路提示。",
        type: "boolean",
        defaultValue: true,
      },
    ],
  },
  Page: AlgorithmPage,
  HomeWidget: AlgorithmWidget,
};

export default algorithmChallenge;
