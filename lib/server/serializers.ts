import type {
  Classroom,
  Comment,
  ModuleInstallState,
  Post,
  PostLike,
  Resource,
  User,
} from "@prisma/client";
import type { AppData } from "@/lib/types";

type PostWithLikes = Post & { likes: PostLike[] };
type ResourceWithAuthor = Resource & { author: User };

const resourceTypeLabels = {
  note: "笔记",
  paper: "试卷",
  slide: "课件",
  link: "链接",
  other: "其他",
} as const;

export function serializeUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    studentId: user.studentId,
    className: user.className,
    avatar: user.avatar,
    bio: user.bio,
    joinedAt: user.joinedAt.toISOString(),
    role: user.role,
  };
}

export function serializeClassroom(classroom: Classroom) {
  return {
    id: classroom.id,
    name: classroom.name,
    inviteCode: classroom.inviteCode,
    slogan: classroom.slogan,
  };
}

export function serializePost(post: PostWithLikes) {
  return {
    id: post.id,
    userId: post.userId,
    type: post.type,
    content: post.content,
    tags: post.tags,
    subject: post.subject || undefined,
    duration: post.duration || undefined,
    image: post.image || undefined,
    likes: post.likes.map((like) => like.userId),
    createdAt: post.createdAt.toISOString(),
  };
}

export function serializeComment(comment: Comment) {
  return {
    id: comment.id,
    postId: comment.postId,
    userId: comment.userId,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
  };
}

export function serializeModuleState(state: ModuleInstallState) {
  return {
    moduleId: state.moduleId,
    enabled: state.enabled,
    installedVersion: state.installedVersion,
    config:
      typeof state.config === "object" && state.config !== null
        ? (state.config as Record<string, unknown>)
        : {},
    status: state.status === "error" ? "error" as const : "ready" as const,
    error: state.error || undefined,
    rollback:
      typeof state.rollback === "object" && state.rollback !== null
        ? (state.rollback as unknown as AppData["modules"][string]["rollback"])
        : undefined,
  };
}

export function serializeResource(resource: ResourceWithAuthor) {
  return {
    id: resource.id,
    title: resource.title,
    subject: resource.subject,
    type: resourceTypeLabels[resource.type],
    url: resource.url || "",
    description: resource.description,
    tags: resource.tags,
    authorId: resource.authorId,
    authorName: resource.author.name,
    createdAt: resource.createdAt.toISOString(),
  };
}
