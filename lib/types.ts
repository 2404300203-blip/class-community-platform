export type PostType = "learning" | "daily";
export type UserRole = "member" | "maintainer";

export interface User {
  id: string;
  name: string;
  studentId: string;
  className: string;
  avatar: string;
  bio: string;
  joinedAt: string;
  role: UserRole;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  type: PostType;
  content: string;
  tags: string[];
  subject?: string;
  duration?: number;
  image?: string;
  likes: string[];
  createdAt: string;
}

export type ResourceType = "笔记" | "试卷" | "课件" | "链接" | "其他";

export interface ResourceItem {
  id: string;
  title: string;
  subject: string;
  type: ResourceType;
  url: string;
  description: string;
  tags: string[];
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface Classroom {
  id: string;
  name: string;
  inviteCode: string;
  slogan: string;
}

export interface ModuleRollbackState {
  version: string;
  config: Record<string, unknown>;
}

export interface ModuleInstallState {
  moduleId: string;
  enabled: boolean;
  installedVersion: string;
  config: Record<string, unknown>;
  status: "ready" | "error";
  error?: string;
  rollback?: ModuleRollbackState;
}

export interface AppData {
  classroom: Classroom;
  users: User[];
  posts: Post[];
  comments: Comment[];
  resources: ResourceItem[];
  currentUserId: string | null;
  modules: Record<string, ModuleInstallState>;
}
