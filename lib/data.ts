import { AppData, ModuleInstallState, User } from "./types";

export const STORAGE_KEY = "class-together-space-v1";
export const DEMO_INVITE_CODE = "QINGCHUN26";
const LEGACY_CLASSROOM_NAME = "高二（3）班";

export const defaultModuleStates: Record<string, ModuleInstallState> = {
  "algorithm-challenge": {
    moduleId: "algorithm-challenge",
    enabled: true,
    installedVersion: "1.0.0",
    config: {
      difficulty: "all",
      showHints: true,
    },
    status: "ready",
  },
  "resource-library": {
    moduleId: "resource-library",
    enabled: true,
    installedVersion: "1.0.0",
    config: {},
    status: "ready",
  },
};

export const seedData: AppData = {
  classroom: {
    id: "class-01",
    name: "人工智能12402班",
    inviteCode: DEMO_INVITE_CODE,
    slogan: "一起认真，也一起热烈。",
  },
  currentUserId: null,
  users: [
    {
      id: "u-chen",
      name: "陈予安",
      studentId: "2024012401",
      className: "人工智能12402班",
      avatar: "陈",
      bio: "慢慢来，也会很快。",
      joinedAt: "2026-05-18T08:00:00.000Z",
      role: "maintainer",
    },
    {
      id: "u-lin",
      name: "林小满",
      studentId: "2024012402",
      className: "人工智能12402班",
      avatar: "林",
      bio: "爱摄影，也爱解难题。",
      joinedAt: "2026-05-18T08:00:00.000Z",
      role: "member",
    },
    {
      id: "u-zhou",
      name: "周嘉树",
      studentId: "2024012403",
      className: "人工智能12402班",
      avatar: "周",
      bio: "今天也向前一点点。",
      joinedAt: "2026-05-19T08:00:00.000Z",
      role: "member",
    },
  ],
  posts: [
    {
      id: "p-1",
      userId: "u-chen",
      type: "learning",
      subject: "数学",
      duration: 75,
      content:
        "重新整理了圆锥曲线的离心率题型。先画图确认几何关系，再列式，比一上来硬算清晰很多。",
      tags: ["错题复盘", "圆锥曲线"],
      image: "indigo",
      likes: ["u-lin", "u-zhou"],
      createdAt: "2026-06-06T02:18:00.000Z",
    },
    {
      id: "p-2",
      userId: "u-lin",
      type: "daily",
      content: "晚霞刚好落在教学楼窗边。今天的风很舒服，放学路也变得很长。",
      tags: ["校园晚霞", "放学"],
      image: "sunset",
      likes: ["u-chen", "u-zhou"],
      createdAt: "2026-06-05T10:42:00.000Z",
    },
    {
      id: "p-3",
      userId: "u-zhou",
      type: "learning",
      subject: "英语",
      duration: 40,
      content:
        "精读了一篇关于城市公共空间的文章，摘了 8 个表达。长难句拆成主干后就没那么可怕了。",
      tags: ["阅读积累", "长难句"],
      likes: ["u-chen"],
      createdAt: "2026-06-04T13:05:00.000Z",
    },
    {
      id: "p-4",
      userId: "u-chen",
      type: "daily",
      content: "值日结束后的教室，桌椅整整齐齐。给今天画一个小小的句号。",
      tags: ["班级日常"],
      image: "classroom",
      likes: ["u-lin"],
      createdAt: "2026-06-03T09:16:00.000Z",
    },
  ],
  comments: [
    {
      id: "c-1",
      postId: "p-1",
      userId: "u-lin",
      content: "画图这一步真的很重要，记下了！",
      createdAt: "2026-06-06T02:31:00.000Z",
    },
    {
      id: "c-2",
      postId: "p-2",
      userId: "u-chen",
      content: "这张晚霞有夏天的感觉。",
      createdAt: "2026-06-05T11:02:00.000Z",
    },
  ],
  resources: [
    {
      id: "resource-seed-1",
      title: "高数极限题型整理",
      subject: "高等数学",
      type: "笔记",
      url: "",
      description: "按题型整理了常见极限求法，适合考前快速复盘。",
      tags: ["极限", "复习"],
      authorId: "u-chen",
      authorName: "陈予安",
      createdAt: "2026-06-05T08:10:00.000Z",
    },
    {
      id: "resource-seed-2",
      title: "Python 数据处理入门清单",
      subject: "程序设计",
      type: "链接",
      url: "https://docs.python.org/zh-cn/3/tutorial/",
      description: "适合刚开始学 Python 的同学，先看基础语法和数据结构部分。",
      tags: ["Python", "入门"],
      authorId: "u-lin",
      authorName: "林小满",
      createdAt: "2026-06-04T12:20:00.000Z",
    },
  ],
  modules: defaultModuleStates,
};

function migrateData(saved: Partial<AppData>): AppData {
  const users = (saved.users || seedData.users).map((user, index) => ({
    ...user,
    studentId: user.studentId || "",
    className: user.className || seedData.classroom.name,
    role: user.role || (index === 0 ? "maintainer" : "member"),
  }));

  const savedClassroom = saved.classroom
    ? {
        ...saved.classroom,
        name:
          saved.classroom.name === LEGACY_CLASSROOM_NAME
            ? seedData.classroom.name
            : saved.classroom.name,
      }
    : undefined;

  return {
    ...seedData,
    ...saved,
    classroom: { ...seedData.classroom, ...savedClassroom },
    users,
    posts: saved.posts || seedData.posts,
    comments: saved.comments || seedData.comments,
    resources: saved.resources || seedData.resources,
    modules: {
      ...structuredClone(defaultModuleStates),
      ...(saved.modules || {}),
    },
  };
}

export function loadData(): AppData {
  if (typeof window === "undefined") return seedData;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return seedData;
  try {
    return migrateData(JSON.parse(saved) as Partial<AppData>);
  } catch {
    return seedData;
  }
}

export function saveData(data: AppData) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function makeUser(name: string, studentId: string, className: string): User {
  return {
    id: `u-${Date.now()}`,
    name,
    studentId,
    className,
    avatar: name.slice(0, 1),
    bio: "很高兴和大家一起记录成长。",
    joinedAt: new Date().toISOString(),
    role: "member",
  };
}
