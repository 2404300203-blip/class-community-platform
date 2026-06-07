"use client";

import {
  BarChart3,
  Bell,
  Blocks,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Heart,
  Home,
  Image as ImageIcon,
  LogOut,
  Menu,
  MessageCircle,
  MoreHorizontal,
  PenLine,
  Plus,
  Quote,
  Search,
  Send,
  Sparkles,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ModuleCenter } from "@/components/modules/module-center";
import { ModuleIcon } from "@/components/modules/module-icon";
import { ModuleSurface } from "@/components/modules/module-runtime";
import {
  DEMO_INVITE_CODE,
} from "@/lib/data";
import { moduleRegistry, getModuleById } from "@/lib/modules/registry";
import {
  getModuleDefaults,
  mergeModuleSettings,
  type ModuleContext,
} from "@/lib/modules/sdk";
import {
  createModuleStorage,
  createSharedModuleStorage,
} from "@/lib/modules/storage";
import { AppData, Post, PostType, User } from "@/lib/types";

type AuthMode = "login" | "register";

async function apiJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };
  if (!response.ok) {
    throw new Error(data.error || "请求失败");
  }
  return data;
}

type CoreTab =
  | "home"
  | "learning"
  | "daily"
  | "publish"
  | "modules"
  | "profile";
type AppRoute = CoreTab | `module:${string}`;

const navItems: { id: CoreTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "首页", icon: Home },
  { id: "learning", label: "学习", icon: BookOpen },
  { id: "publish", label: "发布", icon: Plus },
  { id: "daily", label: "日常", icon: Sparkles },
  { id: "modules", label: "模块", icon: Blocks },
  { id: "profile", label: "我的", icon: UserRound },
];

const mobileNavItems = navItems.filter((item) =>
  ["home", "learning", "publish", "modules", "profile"].includes(item.id),
);

const subjectStyles: Record<string, string> = {
  数学: "bg-indigo-50 text-indigo-700",
  英语: "bg-emerald-50 text-emerald-700",
  语文: "bg-rose-50 text-rose-700",
  物理: "bg-sky-50 text-sky-700",
  化学: "bg-amber-50 text-amber-700",
  其他: "bg-slate-100 text-slate-600",
};

function displayTime(value: string) {
  const date = new Date(value);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff > 0 && diff < 60 * 60 * 1000) {
    return `${Math.max(1, Math.floor(diff / 60000))} 分钟前`;
  }
  if (date.toDateString() === now.toDateString()) {
    return `今天 ${date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}`;
  }
  return date.toLocaleDateString("zh-CN", { month: "long", day: "numeric" });
}

function Avatar({
  user,
  size = "md",
}: {
  user: User;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-20 w-20 text-2xl",
  };
  const colors = [
    "from-indigo-400 to-violet-600",
    "from-amber-300 to-orange-500",
    "from-emerald-300 to-teal-600",
    "from-rose-300 to-pink-600",
  ];
  const color = colors[user.name.charCodeAt(0) % colors.length];
  return (
    <div
      className={`${sizes[size]} shrink-0 rounded-[34%] bg-gradient-to-br ${color} flex items-center justify-center font-bold text-white shadow-sm`}
    >
      {user.avatar}
    </div>
  );
}

function JoinScreen({
  onJoin,
}: {
  onJoin: (mode: AuthMode, profile: {
    name: string;
    studentId: string;
    className: string;
    password: string;
    inviteCode: string;
  }) => void;
}) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [className, setClassName] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (mode === "register" && name.trim().length < 2) {
      setError("请填写至少 2 个字的昵称");
      return;
    }
    if (!studentId.trim()) {
      setError("请填写学号");
      return;
    }
    if (mode === "register" && !className.trim()) {
      setError("请填写班级");
      return;
    }
    if (password.length < 6) {
      setError("密码至少需要 6 位");
      return;
    }
    if (mode === "register" && !code.trim()) {
      setError("请填写班级邀请码");
      return;
    }
    onJoin(mode, {
      name: name.trim(),
      studentId: studentId.trim(),
      className: className.trim(),
      password,
      inviteCode: code.trim(),
    });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f8fc] px-5 py-8 lg:grid lg:grid-cols-[1.08fr_.92fr] lg:p-0">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#5556dc] p-14 text-white lg:flex lg:flex-col">
        <div className="soft-grid absolute inset-0 opacity-70" />
        <div className="absolute -right-28 top-24 h-96 w-96 rounded-full bg-violet-400/40 blur-3xl" />
        <div className="absolute -bottom-32 left-12 h-96 w-96 rounded-full bg-blue-400/25 blur-3xl" />
        <div className="relative flex items-center gap-3 font-bold">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#5556dc]">
            <UsersRound size={20} strokeWidth={2.6} />
          </div>
          班级共建空间
        </div>
        <div className="relative my-auto max-w-xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-indigo-50 backdrop-blur">
            <Sparkles size={15} />
            属于我们的线上班级角落
          </div>
          <h1 className="text-5xl font-extrabold leading-[1.24] tracking-tight">
            一起认真，
            <br />
            也一起热烈。
          </h1>
          <p className="mt-7 max-w-md text-lg leading-8 text-indigo-100">
            记录每一次专注学习，也收藏课间、晚霞和笑声。让成长有迹可循，让班级更有温度。
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-4">
          {[
            ["每日打卡", "把坚持变得可见"],
            ["分享日常", "收藏共同的青春"],
            ["彼此回应", "每份认真都有回声"],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
            >
              <div className="font-semibold">{title}</div>
              <div className="mt-1 text-xs text-indigo-100">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center lg:min-h-screen">
        <div className="w-full">
          <div className="mb-9 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5b5be8] text-white">
              <UsersRound size={20} />
            </div>
            <span className="font-bold">班级共建空间</span>
          </div>
          <p className="text-sm font-semibold text-[#5b5be8]">欢迎加入</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
            {mode === "login" ? "登录班级空间" : "找到你的班级伙伴"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {mode === "login"
              ? "输入学号和密码，即可回到班级空间。"
              : "输入昵称、学号、班级和老师分享的邀请码，即可注册进入。"}
          </p>

          <form onSubmit={submit} className="mt-9 space-y-5">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
              {(["login", "register"] as AuthMode[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setMode(item);
                    setError("");
                  }}
                  className={`rounded-xl py-2.5 text-sm font-semibold transition ${
                    mode === item
                      ? "bg-white text-[#5353d7] shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  {item === "login" ? "登录" : "注册"}
                </button>
              ))}
            </div>
            {mode === "register" && (
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">你的昵称</span>
                <input
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setError("");
                  }}
                  placeholder="例如：许知夏"
                  className="h-13 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#6868e7] focus:ring-4 focus:ring-indigo-100"
                />
              </label>
            )}
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">学号</span>
              <input
                value={studentId}
                onChange={(event) => {
                  setStudentId(event.target.value);
                  setError("");
                }}
                placeholder="例如：2024012401"
                className="h-13 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#6868e7] focus:ring-4 focus:ring-indigo-100"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">密码</span>
              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="至少 6 位"
                className="h-13 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#6868e7] focus:ring-4 focus:ring-indigo-100"
              />
            </label>
            {mode === "register" && (
              <>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">班级</span>
                  <input
                    value={className}
                    onChange={(event) => {
                      setClassName(event.target.value);
                      setError("");
                    }}
                    placeholder="例如：人工智能12402班"
                    className="h-13 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-[#6868e7] focus:ring-4 focus:ring-indigo-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">班级邀请码</span>
                  <input
                    value={code}
                    onChange={(event) => {
                      setCode(event.target.value);
                      setError("");
                    }}
                    placeholder="请输入邀请码"
                    className="h-13 w-full rounded-2xl border border-slate-200 bg-white px-4 uppercase tracking-widest outline-none transition focus:border-[#6868e7] focus:ring-4 focus:ring-indigo-100"
                  />
                </label>
              </>
            )}
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
                <X size={16} />
                {error}
              </div>
            )}
            <button className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#5b5be8] font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-[#4949cf]">
              {mode === "login" ? "登录班级空间" : "进入班级空间"}{" "}
              <ChevronRight size={18} />
            </button>
          </form>

          {mode === "register" && (
            <div className="mt-6 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/60 p-4 text-sm text-indigo-700">
            <span className="font-semibold">演示邀请码：</span>
            <button
              type="button"
              onClick={() => setCode(DEMO_INVITE_CODE)}
              className="ml-2 rounded-lg bg-white px-2 py-1 font-mono font-bold tracking-wider shadow-sm"
            >
              {DEMO_INVITE_CODE}
            </button>
          </div>
          )}
        </div>
      </section>
    </main>
  );
}

function ImagePlaceholder({ tone }: { tone: string }) {
  const styles: Record<string, string> = {
    indigo:
      "from-indigo-700 via-violet-500 to-orange-300 after:bg-[radial-gradient(circle_at_68%_35%,rgba(255,255,255,.85),transparent_10%)]",
    sunset:
      "from-indigo-800 via-rose-400 to-amber-200 after:bg-[linear-gradient(18deg,rgba(33,41,74,.65)_0_23%,transparent_24%)]",
    classroom:
      "from-sky-300 via-cyan-100 to-amber-100 after:bg-[linear-gradient(90deg,rgba(75,88,124,.65)_2px,transparent_2px)] after:bg-[size:52px_100%]",
    fresh:
      "from-emerald-300 via-cyan-200 to-indigo-300 after:bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,.7),transparent_14%)]",
  };
  return (
    <div
      className={`relative mt-4 aspect-[16/9] overflow-hidden rounded-2xl bg-gradient-to-br ${styles[tone] || styles.fresh} after:absolute after:inset-0 after:content-['']`}
    >
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded-full bg-black/20 px-3 py-1.5 text-xs text-white backdrop-blur-md">
        <ImageIcon size={13} />
        图片占位
      </div>
    </div>
  );
}

function PostCard({
  post,
  data,
  onLike,
  onComment,
  onDelete,
}: {
  post: Post;
  data: AppData;
  onLike: (id: string) => void;
  onComment: (id: string, value: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const user = data.users.find((item) => item.id === post.userId)!;
  const currentUser = data.users.find(
    (item) => item.id === data.currentUserId,
  )!;
  const comments = data.comments.filter((item) => item.postId === post.id);
  const liked = post.likes.includes(currentUser.id);
  const isMine = post.userId === currentUser.id;
  const subjectClass = subjectStyles[post.subject || "其他"] || subjectStyles.其他;

  return (
    <article className="card rise rounded-[24px] p-4 sm:p-5">
      <header className="flex items-center gap-3">
        <Avatar user={user} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-bold">{user.name}</span>
            {isMine && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                我
              </span>
            )}
          </div>
          <div className="mt-0.5 text-xs text-slate-400">
            {displayTime(post.createdAt)}
          </div>
        </div>
        {isMine ? (
          <button
            onClick={() => onDelete(post.id)}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
            aria-label="删除帖子"
          >
            <Trash2 size={17} />
          </button>
        ) : (
          <button className="rounded-xl p-2 text-slate-400 hover:bg-slate-50">
            <MoreHorizontal size={18} />
          </button>
        )}
      </header>

      {post.type === "learning" && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${subjectClass}`}
          >
            {post.subject}
          </span>
          <span className="flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1 text-xs text-slate-500">
            <Clock3 size={13} />
            专注 {post.duration} 分钟
          </span>
        </div>
      )}

      <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
        {post.content}
      </p>
      {post.image && <ImagePlaceholder tone={post.image} />}

      <div className="mt-4 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span key={tag} className="text-xs font-medium text-[#6161da]">
            #{tag}
          </span>
        ))}
      </div>

      <footer className="mt-4 flex items-center gap-1 border-t border-slate-100 pt-3">
        <button
          onClick={() => onLike(post.id)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium transition ${
            liked
              ? "bg-rose-50 text-rose-500"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
          {post.likes.length || "点赞"}
        </button>
        <button
          onClick={() => setShowComments((value) => !value)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-50"
        >
          <MessageCircle size={16} />
          {comments.length || "评论"}
        </button>
      </footer>

      {showComments && (
        <div className="mt-3 rounded-2xl bg-slate-50 p-3">
          <div className="space-y-3">
            {comments.map((item) => {
              const author = data.users.find(
                (entry) => entry.id === item.userId,
              )!;
              return (
                <div key={item.id} className="flex gap-2.5">
                  <Avatar user={author} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold">{author.name}</p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">
                      {item.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!comment.trim()) return;
              onComment(post.id, comment.trim());
              setComment("");
            }}
          >
            <input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="写下你的回应..."
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
            <button
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#5b5be8] text-white"
              aria-label="发送评论"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </article>
  );
}

function SummaryHero({
  data,
  onPublish,
}: {
  data: AppData;
  onPublish: () => void;
}) {
  const current = data.users.find((user) => user.id === data.currentUserId)!;
  const totalMinutes = data.posts
    .filter((post) => post.type === "learning")
    .reduce((sum, post) => sum + (post.duration || 0), 0);
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-[#5758dd] p-6 text-white shadow-xl shadow-indigo-200/60 sm:p-8">
      <div className="soft-grid absolute inset-0 opacity-50" />
      <div className="absolute -right-12 -top-24 h-64 w-64 rounded-full bg-purple-400/50 blur-3xl" />
      <div className="relative">
        <p className="text-sm text-indigo-100">嗨，{current.name}</p>
        <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
          今天也一起，向前一点点。
        </h1>
        <div className="mt-6 grid grid-cols-3 divide-x divide-white/15 rounded-2xl border border-white/15 bg-white/10 py-4 backdrop-blur-sm">
          <div className="px-3">
            <div className="text-xl font-bold">{data.posts.length}</div>
            <div className="mt-1 text-[11px] text-indigo-100">班级动态</div>
          </div>
          <div className="px-3">
            <div className="text-xl font-bold">{totalMinutes}</div>
            <div className="mt-1 text-[11px] text-indigo-100">学习分钟</div>
          </div>
          <div className="px-3">
            <div className="text-xl font-bold">{data.users.length}</div>
            <div className="mt-1 text-[11px] text-indigo-100">同行伙伴</div>
          </div>
        </div>
        <button
          onClick={onPublish}
          className="mt-5 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#5152d5] shadow-sm"
        >
          <PenLine size={16} />
          记录此刻
        </button>
      </div>
    </section>
  );
}

function EmptyState({ type, onPublish }: { type: string; onPublish: () => void }) {
  return (
    <div className="card rounded-[24px] px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
        <Quote size={24} />
      </div>
      <h3 className="mt-4 font-bold">这里还安安静静的</h3>
      <p className="mt-2 text-sm text-slate-500">成为第一个分享{type}的人吧。</p>
      <button
        onClick={onPublish}
        className="mt-5 rounded-xl bg-[#5b5be8] px-4 py-2 text-sm font-semibold text-white"
      >
        去发布
      </button>
    </div>
  );
}

function Feed({
  posts,
  data,
  onLike,
  onComment,
  onDelete,
  onPublish,
  emptyLabel,
}: {
  posts: Post[];
  data: AppData;
  onLike: (id: string) => void;
  onComment: (id: string, value: string) => void;
  onDelete: (id: string) => void;
  onPublish: () => void;
  emptyLabel: string;
}) {
  if (!posts.length) return <EmptyState type={emptyLabel} onPublish={onPublish} />;
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          data={data}
          onLike={onLike}
          onComment={onComment}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function Composer({
  initialType,
  onSubmit,
  onCancel,
}: {
  initialType: PostType;
  onSubmit: (post: Omit<Post, "id" | "userId" | "createdAt" | "likes">) => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState<PostType>(initialType);
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("45");
  const [tags, setTags] = useState("");
  const [hasImage, setHasImage] = useState(false);
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (content.trim().length < 5) {
      setError("再多写一点吧，至少需要 5 个字");
      return;
    }
    if (
      type === "learning" &&
      (!Number(duration) || Number(duration) < 1 || Number(duration) > 600)
    ) {
      setError("请输入 1 至 600 分钟的学习时长");
      return;
    }
    if (type === "learning" && subject.trim().length < 1) {
      setError("请填写学科或学习方向");
      return;
    }
    onSubmit({
      type,
      content: content.trim(),
      tags: tags
        .split(/[,，\s]+/)
        .map((tag) => tag.replace(/^#/, "").trim())
        .filter(Boolean)
        .slice(0, 4),
      subject: type === "learning" ? subject.trim() : undefined,
      duration: type === "learning" ? Number(duration) : undefined,
      image: hasImage ? "fresh" : undefined,
    });
  }

  return (
    <section className="card rise overflow-hidden rounded-[26px]">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#5b5be8]">CREATE</p>
            <h1 className="mt-1 text-xl font-extrabold">发布新动态</h1>
          </div>
          <button
            onClick={onCancel}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      <form onSubmit={submit} className="space-y-6 p-5 sm:p-7">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
          {(["learning", "daily"] as PostType[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setType(item);
                setError("");
              }}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
                type === item
                  ? "bg-white text-[#5353d7] shadow-sm"
                  : "text-slate-500"
              }`}
            >
              {item === "learning" ? (
                <BookOpen size={16} />
              ) : (
                <Sparkles size={16} />
              )}
              {item === "learning" ? "学习打卡" : "日常分享"}
            </button>
          ))}
        </div>

        {type === "learning" && (
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="mb-2 block text-sm font-semibold">学科</span>
              <input
                value={subject}
                onChange={(event) => {
                  setSubject(event.target.value);
                  setError("");
                }}
                maxLength={24}
                placeholder="例如：数据结构"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-indigo-400"
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold">学习时长</span>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="600"
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 pr-12 outline-none focus:border-indigo-400"
                />
                <span className="absolute right-3 top-3 text-sm text-slate-400">
                  分钟
                </span>
              </div>
            </label>
          </div>
        )}

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">
            {type === "learning" ? "知识点与心得" : "分享此刻"}
          </span>
          <textarea
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              setError("");
            }}
            rows={6}
            maxLength={500}
            placeholder={
              type === "learning"
                ? "今天学了什么？哪一点让你印象深刻？"
                : "这一刻，有什么想和大家分享？"
            }
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/60 p-4 leading-7 outline-none transition focus:border-indigo-400 focus:bg-white"
          />
          <span className="mt-1 block text-right text-xs text-slate-400">
            {content.length}/500
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">话题标签</span>
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="用空格或逗号分隔，例如：错题复盘 今日份努力"
            className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-400"
          />
        </label>

        <button
          type="button"
          onClick={() => setHasImage((value) => !value)}
          className={`flex w-full items-center justify-between rounded-2xl border border-dashed p-4 text-left transition ${
            hasImage
              ? "border-indigo-300 bg-indigo-50 text-indigo-700"
              : "border-slate-300 text-slate-500 hover:border-indigo-300"
          }`}
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
              {hasImage ? <Check size={18} /> : <ImageIcon size={18} />}
            </span>
            <span>
              <span className="block text-sm font-semibold">
                {hasImage ? "已添加图片占位" : "添加图片占位"}
              </span>
              <span className="mt-0.5 block text-xs opacity-70">
                原型暂不上传真实文件
              </span>
            </span>
          </span>
          <ChevronRight size={18} />
        </button>

        {error && (
          <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-12 flex-1 rounded-xl border border-slate-200 font-semibold text-slate-600"
          >
            取消
          </button>
          <button className="h-12 flex-[2] rounded-xl bg-[#5b5be8] font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-[#4848cf]">
            发布动态
          </button>
        </div>
      </form>
    </section>
  );
}

function Profile({
  data,
  posts,
  onLike,
  onComment,
  onDelete,
  onPublish,
  onLogout,
}: {
  data: AppData;
  posts: Post[];
  onLike: (id: string) => void;
  onComment: (id: string, value: string) => void;
  onDelete: (id: string) => void;
  onPublish: () => void;
  onLogout: () => void;
}) {
  const user = data.users.find((item) => item.id === data.currentUserId)!;
  const learningPosts = posts.filter((post) => post.type === "learning");
  const totalMinutes = learningPosts.reduce(
    (sum, post) => sum + (post.duration || 0),
    0,
  );
  return (
    <div className="space-y-5">
      <section className="card relative overflow-hidden rounded-[28px]">
        <div className="h-32 bg-gradient-to-br from-[#5455db] via-[#7374e9] to-[#f2a65a]">
          <div className="soft-grid h-full opacity-50" />
        </div>
        <div className="px-5 pb-6 sm:px-7">
          <div className="-mt-10 flex items-end justify-between">
            <div className="rounded-[30%] border-4 border-white">
              <Avatar user={user} size="lg" />
            </div>
            <div className="mb-1 flex flex-wrap justify-end gap-2">
              <button className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">
                编辑资料
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600"
              >
                <LogOut size={14} />
                退出账号
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <h1 className="text-xl font-extrabold">{user.name}</h1>
            <span
              className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                user.role === "maintainer"
                  ? "bg-indigo-50 text-indigo-600"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {user.role === "maintainer" ? "班级维护者" : "班级成员"}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{user.bio}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {user.studentId && (
              <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-slate-500">
                学号 {user.studentId}
              </span>
            )}
            {user.className && (
              <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-slate-500">
                {user.className}
              </span>
            )}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <CalendarDays size={14} />
            {new Date(user.joinedAt).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
            })}
            加入班级空间
          </p>
          <div className="mt-6 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-slate-50 py-4 text-center">
            <div>
              <div className="text-lg font-extrabold">{learningPosts.length}</div>
              <div className="mt-1 text-[11px] text-slate-400">打卡天数</div>
            </div>
            <div>
              <div className="text-lg font-extrabold">{posts.length}</div>
              <div className="mt-1 text-[11px] text-slate-400">发布动态</div>
            </div>
            <div>
              <div className="text-lg font-extrabold">{totalMinutes}</div>
              <div className="mt-1 text-[11px] text-slate-400">学习分钟</div>
            </div>
          </div>
        </div>
      </section>
      <div className="flex items-center justify-between px-1">
        <h2 className="font-extrabold">我的发布</h2>
        <span className="text-xs text-slate-400">共 {posts.length} 条</span>
      </div>
      <Feed
        posts={posts}
        data={data}
        onLike={onLike}
        onComment={onComment}
        onDelete={onDelete}
        onPublish={onPublish}
        emptyLabel="第一条动态"
      />
    </div>
  );
}

function DesktopAside({
  data,
  onPublish,
}: {
  data: AppData;
  onPublish: () => void;
}) {
  const activeUsers = data.users.slice(0, 3);
  return (
    <aside className="sticky top-24 hidden h-fit w-[280px] shrink-0 space-y-4 xl:block">
      <section className="card rounded-[24px] p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">本周共建</h3>
          <BarChart3 size={17} className="text-indigo-500" />
        </div>
        <div className="mt-5 space-y-4">
          <div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">学习目标</span>
              <span className="font-semibold">18 / 25 次</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[72%] rounded-full bg-[#5b5be8]" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">日常收集</span>
              <span className="font-semibold">12 / 20 条</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[60%] rounded-full bg-[#ffb35c]" />
            </div>
          </div>
        </div>
      </section>
      <section className="card rounded-[24px] p-5">
        <h3 className="text-sm font-bold">最近活跃</h3>
        <div className="mt-4 space-y-4">
          {activeUsers.map((user, index) => (
            <div key={user.id} className="flex items-center gap-3">
              <Avatar user={user} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{user.name}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {index === 0 ? "刚刚发布了动态" : `${index + 1} 小时前活跃`}
                </p>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
          ))}
        </div>
      </section>
      <button
        onClick={onPublish}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#5b5be8] py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200"
      >
        <Plus size={17} />
        发布新动态
      </button>
    </aside>
  );
}

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<AppRoute>("home");
  const [publishType, setPublishType] = useState<PostType>("learning");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState("");
  const initializedModules = useRef(new Set<string>());

  const update = useCallback((next: (previous: AppData) => AppData) => {
    setData((previous) => (previous ? next(previous) : previous));
  }, []);

  const refreshData = useCallback(async () => {
    const nextData = await apiJson<AppData>("/api/app-data");
    setData(nextData);
  }, []);

  const navigate = useCallback((path: string) => {
    if (
      path.startsWith("module:") ||
      ["home", "learning", "daily", "publish", "modules", "profile"].includes(
        path,
      )
    ) {
      setTab(path as AppRoute);
      setMobileMenu(false);
    }
  }, []);

  const notify = useCallback((message: string) => setToast(message), []);

  const moduleContexts = useMemo<Record<string, ModuleContext>>(() => {
    if (!data?.currentUserId) return {};
    const currentUser = data.users.find(
      (user) => user.id === data.currentUserId,
    );
    if (!currentUser) return {};

    return Object.fromEntries(
      moduleRegistry.map((module) => [
        module.manifest.id,
        {
          currentUser: Object.freeze({ ...currentUser }),
          classroom: Object.freeze({ ...data.classroom }),
          storage: createModuleStorage(module.manifest.id, currentUser.id),
          sharedStorage: createSharedModuleStorage(module.manifest.id),
          resources: data.resources,
          addResource: async (resource) => {
            await apiJson("/api/resources", {
              method: "POST",
              body: JSON.stringify(resource),
            });
            await refreshData();
          },
          removeResource: async (resourceId) => {
            await apiJson(`/api/resources/${resourceId}`, {
              method: "DELETE",
            });
            await refreshData();
          },
          navigate,
          notify,
        },
      ]),
    );
  }, [data, navigate, notify, refreshData]);

  useEffect(() => {
    let cancelled = false;
    apiJson<AppData>("/api/app-data")
      .then((nextData) => {
        if (!cancelled) setData(nextData);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!data) return;
    for (const classModule of moduleRegistry) {
      const state = data.modules[classModule.manifest.id];
      const context = moduleContexts[classModule.manifest.id];
      const setupKey = `${classModule.manifest.id}:${classModule.manifest.version}:${data.currentUserId}`;
      if (
        !state?.enabled ||
        state.status === "error" ||
        !classModule.setup ||
        !context ||
        initializedModules.current.has(setupKey)
      ) {
        continue;
      }
      initializedModules.current.add(setupKey);
      Promise.resolve()
        .then(() => classModule.setup?.(context))
        .catch((error: unknown) => {
          const message =
            error instanceof Error ? error.message : "模块初始化失败";
          update((previous) => ({
            ...previous,
            modules: {
              ...previous.modules,
              [classModule.manifest.id]: {
                ...state,
                enabled: false,
                status: "error",
                error: message,
              },
            },
          }));
          setToast(`${classModule.manifest.name}初始化失败，已自动停用`);
        });
    }
  }, [data, moduleContexts, update]);

  const sortedPosts = useMemo(
    () =>
      [...(data?.posts || [])].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [data?.posts],
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        正在打开班级空间...
      </div>
    );
  }

  async function join(mode: AuthMode, profile: {
    name: string;
    studentId: string;
    className: string;
    password: string;
    inviteCode: string;
  }) {
    try {
      await apiJson(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        body: JSON.stringify(profile),
      });
      await refreshData();
      setToast(mode === "login" ? "登录成功" : "注册成功，欢迎来到班级空间");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "登录失败");
    }
  }

  function handleUnauthorized() {
    setData(null);
    setTab("home");
    setMobileMenu(false);
  }

  if (!data?.currentUserId) return <JoinScreen onJoin={join} />;

  function openPublish(type: PostType = "learning") {
    setPublishType(type);
    setTab("publish");
    setMobileMenu(false);
  }

  function openModule(moduleId: string) {
    const classModule = getModuleById(moduleId);
    const state = data?.modules[moduleId];
    if (!classModule || !state?.enabled) {
      setToast("该模块当前未启用");
      setTab("modules");
      return;
    }
    setTab(`module:${moduleId}`);
    setMobileMenu(false);
  }

  async function changeModuleState(
    moduleId: string,
    nextState: AppData["modules"][string],
  ) {
    const user = data?.users.find((item) => item.id === data.currentUserId);
    const previousState = data?.modules[moduleId];
    if (user?.role !== "maintainer") {
      setToast("只有班级维护者可以管理模块");
      return;
    }
    let savedState = nextState;
    try {
      const result = await apiJson<{ state: AppData["modules"][string] }>(
        `/api/modules/${moduleId}`,
        {
          method: "PUT",
          body: JSON.stringify(nextState),
        },
      );
      savedState = result.state;
      update((previous) => ({
        ...previous,
        modules: {
          ...previous.modules,
          [moduleId]: savedState,
        },
      }));
    } catch (error) {
      setToast(error instanceof Error ? error.message : "模块设置保存失败");
      return;
    }
    if (!nextState.enabled && tab === `module:${moduleId}`) {
      setTab("modules");
    }
    if (previousState?.enabled !== nextState.enabled) {
      setToast(nextState.enabled ? "模块已启用" : "模块已停用");
    } else if (
      previousState?.installedVersion !== nextState.installedVersion
    ) {
      setToast(`模块版本已切换至 v${nextState.installedVersion}`);
    } else {
      setToast("模块设置已保存");
    }
  }

  function markModuleError(moduleId: string, message: string) {
    const classModule = getModuleById(moduleId);
    if (!classModule || !data) return;
    const nextState =
      data.modules[moduleId] || {
        moduleId,
        enabled: true,
        installedVersion: classModule.manifest.version,
        config: getModuleDefaults(classModule.manifest),
        status: "ready" as const,
      };
    void apiJson(`/api/modules/${moduleId}`, {
      method: "PUT",
      body: JSON.stringify({
        ...nextState,
        enabled: false,
        status: "error",
        error: message,
      }),
    }).catch(() => null);
    update((previous) => {
      const current = previous.modules[moduleId] || {
        moduleId,
        enabled: true,
        installedVersion: classModule.manifest.version,
        config: getModuleDefaults(classModule.manifest),
        status: "ready" as const,
      };
      return {
        ...previous,
        modules: {
          ...previous.modules,
          [moduleId]: {
            ...current,
            status: "error",
            error: message,
          },
        },
      };
    });
  }

  async function like(postId: string) {
    try {
      const result = await apiJson<{ post: Post }>(`/api/posts/${postId}/like`, {
        method: "POST",
      });
      update((previous) => ({
        ...previous,
        posts: previous.posts.map((post) =>
          post.id === postId ? result.post : post,
        ),
      }));
    } catch (error) {
      if (error instanceof Error && error.message === "请先登录") {
        handleUnauthorized();
      } else {
        setToast(error instanceof Error ? error.message : "操作失败");
      }
    }
  }

  async function comment(postId: string, content: string) {
    try {
      await apiJson(`/api/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      await refreshData();
      setToast("评论已发布");
    } catch (error) {
      if (error instanceof Error && error.message === "请先登录") {
        handleUnauthorized();
      } else {
        setToast(error instanceof Error ? error.message : "评论失败");
      }
    }
  }

  async function remove(postId: string) {
    try {
      await apiJson(`/api/posts/${postId}`, { method: "DELETE" });
      update((previous) => ({
        ...previous,
        posts: previous.posts.filter((item) => item.id !== postId),
        comments: previous.comments.filter((item) => item.postId !== postId),
      }));
      setToast("动态已删除");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "删除失败");
    }
  }

  async function publish(
    post: Omit<Post, "id" | "userId" | "createdAt" | "likes">,
  ) {
    try {
      const result = await apiJson<{ post: Post }>("/api/posts", {
        method: "POST",
        body: JSON.stringify(post),
      });
      update((previous) => ({
        ...previous,
        posts: [result.post, ...previous.posts],
      }));
      setTab(post.type);
      setToast(post.type === "learning" ? "学习打卡成功" : "日常分享已发布");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "发布失败");
    }
  }

  async function logout() {
    await apiJson("/api/auth/logout", { method: "POST" }).catch(() => null);
    handleUnauthorized();
  }

  async function resetDemo() {
    await logout();
  }

  const currentUser = data.users.find(
    (user) => user.id === data.currentUserId,
  )!;
  const titleMap: Record<CoreTab, string> = {
    home: "班级动态",
    learning: "学习打卡",
    daily: "日常分享",
    publish: "发布动态",
    modules: "模块中心",
    profile: "个人主页",
  };
  const activeModuleId = tab.startsWith("module:")
    ? tab.slice("module:".length)
    : null;
  const activeModule = activeModuleId
    ? getModuleById(activeModuleId)
    : undefined;
  const enabledModules = moduleRegistry.filter(
    (module) => data.modules[module.manifest.id]?.enabled,
  );
  const pageTitle =
    activeModule?.manifest.name ||
    titleMap[tab as CoreTab] ||
    "班级共建空间";
  const visiblePosts =
    tab === "learning" || tab === "daily"
      ? sortedPosts.filter((post) => post.type === tab)
      : sortedPosts;
  const profilePosts = sortedPosts.filter(
    (post) => post.userId === data.currentUserId,
  );

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-17 max-w-[1180px] items-center px-4 sm:px-6">
          <button
            onClick={() => setMobileMenu(true)}
            className="mr-3 rounded-xl p-2 text-slate-500 md:hidden"
            aria-label="打开菜单"
          >
            <Menu size={21} />
          </button>
          <button
            onClick={() => setTab("home")}
            className="flex items-center gap-2.5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5b5be8] text-white">
              <UsersRound size={18} />
            </span>
            <span className="hidden font-extrabold sm:inline">班级共建空间</span>
          </button>
          <nav className="ml-12 hidden h-full items-center gap-1 md:flex">
            {navItems
              .filter(
                (item) => item.id !== "publish" && item.id !== "profile",
              )
              .map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`relative flex h-full items-center gap-2 px-4 text-sm font-semibold transition ${
                      tab === item.id
                        ? "text-[#5556db]"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Icon size={17} />
                    {item.label}
                    {tab === item.id && (
                      <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-[#5b5be8]" />
                    )}
                  </button>
                );
              })}
            {enabledModules.map((module) => (
              <button
                key={module.manifest.id}
                onClick={() => openModule(module.manifest.id)}
                className={`relative flex h-full items-center gap-2 px-3 text-sm font-semibold transition ${
                  activeModuleId === module.manifest.id
                    ? "text-[#5556db]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <ModuleIcon name={module.manifest.icon} size={17} />
                {module.manifest.navigation.label}
                {activeModuleId === module.manifest.id && (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#5b5be8]" />
                )}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button className="hidden rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 sm:block">
              <Search size={19} />
            </button>
            <button className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100">
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
            </button>
            <button
              onClick={() => setTab("profile")}
              className="ml-1 flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100"
            >
              <Avatar user={currentUser} size="sm" />
              <span className="hidden text-xs font-semibold lg:inline">
                {currentUser.name}
              </span>
            </button>
          </div>
        </div>
      </header>

      {mobileMenu && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-sm md:hidden">
          <button
            className="absolute inset-0"
            onClick={() => setMobileMenu(false)}
            aria-label="关闭菜单"
          />
          <aside className="relative h-full w-[82%] max-w-xs bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-extrabold">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5b5be8] text-white">
                  <UsersRound size={18} />
                </span>
                班级共建空间
              </div>
              <button
                onClick={() => setMobileMenu(false)}
                className="rounded-xl p-2 text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-8 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Avatar user={currentUser} />
                <div>
                  <p className="text-sm font-bold">{currentUser.name}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {data.classroom.name}
                  </p>
                </div>
              </div>
            </div>
            <nav className="mt-5 space-y-1">
              {navItems
                .filter((item) => item.id !== "publish")
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(item.id);
                        setMobileMenu(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${
                        tab === item.id
                          ? "bg-indigo-50 text-[#5556db]"
                          : "text-slate-600"
                      }`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </button>
                  );
                })}
              {enabledModules.map((module) => (
                <button
                  key={module.manifest.id}
                  onClick={() => openModule(module.manifest.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${
                    activeModuleId === module.manifest.id
                      ? "bg-indigo-50 text-[#5556db]"
                      : "text-slate-600"
                  }`}
                >
                  <ModuleIcon name={module.manifest.icon} size={18} />
                  {module.manifest.navigation.label}
                  <span className="ml-auto rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] text-indigo-500">
                    模块
                  </span>
                </button>
              ))}
            </nav>
            <button
              onClick={resetDemo}
              className="absolute bottom-6 left-5 right-5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-500 hover:bg-slate-50"
            >
              <LogOut size={18} />
              退出并重置演示
            </button>
          </aside>
        </div>
      )}

      <main className="mx-auto flex max-w-[1180px] gap-6 px-4 py-5 sm:px-6 sm:py-7">
        <div className="min-w-0 flex-1">
          {tab !== "publish" && (
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wider text-[#5b5be8]">
                  {data.classroom.name}
                </p>
                <h1 className="mt-1 text-xl font-extrabold sm:text-2xl">
                  {pageTitle}
                </h1>
              </div>
              {(tab === "learning" || tab === "daily") && (
                <button
                  onClick={() => openPublish(tab)}
                  className="flex items-center gap-1.5 rounded-xl bg-[#5b5be8] px-3.5 py-2.5 text-xs font-semibold text-white"
                >
                  <Plus size={15} /> 发布
                </button>
              )}
            </div>
          )}

          <div className="mx-auto max-w-[720px]">
            {tab === "home" && (
              <div className="space-y-5">
                <SummaryHero data={data} onPublish={() => openPublish()} />
                {enabledModules
                  .filter((module) => module.HomeWidget)
                  .map((module) => {
                    const state = data.modules[module.manifest.id];
                    const context = moduleContexts[module.manifest.id];
                    if (!state || !context) return null;
                    return (
                      <ModuleSurface
                        key={module.manifest.id}
                        module={module}
                        context={context}
                        settings={mergeModuleSettings(
                          module.manifest,
                          state.config,
                        )}
                        surface="widget"
                        onError={(message) =>
                          markModuleError(module.manifest.id, message)
                        }
                      />
                    );
                  })}
                <div className="flex items-center justify-between px-1 pt-1">
                  <h2 className="font-extrabold">最新动态</h2>
                  <span className="text-xs text-slate-400">持续更新中</span>
                </div>
                <Feed
                  posts={visiblePosts}
                  data={data}
                  onLike={like}
                  onComment={comment}
                  onDelete={remove}
                  onPublish={() => openPublish()}
                  emptyLabel="班级动态"
                />
              </div>
            )}
            {(tab === "learning" || tab === "daily") && (
              <Feed
                posts={visiblePosts}
                data={data}
                onLike={like}
                onComment={comment}
                onDelete={remove}
                onPublish={() => openPublish(tab)}
                emptyLabel={tab === "learning" ? "学习记录" : "日常"}
              />
            )}
            {tab === "publish" && (
              <Composer
                key={publishType}
                initialType={publishType}
                onSubmit={publish}
                onCancel={() => setTab("home")}
              />
            )}
            {tab === "profile" && (
              <Profile
                data={data}
                posts={profilePosts}
                onLike={like}
                onComment={comment}
                onDelete={remove}
                onPublish={() => openPublish()}
                onLogout={logout}
              />
            )}
            {tab === "modules" && (
              <ModuleCenter
                modules={moduleRegistry}
                states={data.modules}
                currentUser={currentUser}
                onChange={changeModuleState}
                onOpen={openModule}
              />
            )}
            {activeModule && activeModuleId && (
              <>
                {data.modules[activeModuleId]?.enabled &&
                moduleContexts[activeModuleId] ? (
                  <ModuleSurface
                    module={activeModule}
                    context={moduleContexts[activeModuleId]}
                    settings={mergeModuleSettings(
                      activeModule.manifest,
                      data.modules[activeModuleId].config,
                    )}
                    surface="page"
                    onError={(message) =>
                      markModuleError(activeModuleId, message)
                    }
                  />
                ) : (
                  <section className="card rounded-[24px] p-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Blocks size={24} />
                    </div>
                    <h2 className="mt-4 font-extrabold">模块当前不可用</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      该模块可能已被维护者停用，请前往模块中心查看状态。
                    </p>
                    <button
                      onClick={() => setTab("modules")}
                      className="mt-5 rounded-xl bg-[#5b5be8] px-4 py-2 text-sm font-semibold text-white"
                    >
                      前往模块中心
                    </button>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
        <DesktopAside data={data} onPublish={() => openPublish()} />
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-[22px] border border-white/70 bg-white/92 p-1.5 shadow-[0_14px_40px_rgba(35,39,70,.18)] backdrop-blur-xl md:hidden">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          if (item.id === "publish") {
            return (
              <button
                key={item.id}
                onClick={() => openPublish()}
                className="flex flex-col items-center justify-center"
              >
                <span className="-mt-5 flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-[#f7f7fb] bg-[#5b5be8] text-white shadow-lg shadow-indigo-200">
                  <Plus size={22} />
                </span>
                <span className="mt-1 text-[10px] font-semibold text-slate-500">
                  发布
                </span>
              </button>
            );
          }
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-semibold ${
                active ? "text-[#5556db]" : "text-slate-400"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {toast && (
        <div className="fixed left-1/2 top-20 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-xs font-medium text-white shadow-xl">
          <Check size={15} className="text-emerald-400" />
          {toast}
        </div>
      )}
    </div>
  );
}
