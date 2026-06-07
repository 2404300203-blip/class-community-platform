# Class Community Platform

一个面向班级共建的线上社区平台原型。项目以“学习打卡 + 日常分享 + 可扩展模块”为核心，让班级成员可以记录学习过程、分享校园日常，并通过模块机制扩展新的班级工具。

当前版本已接入 Next.js API、Prisma 和 PostgreSQL，支持真实账号登录、班级共享动态和资料库数据。

## 功能概览

- 班级入口：注册时使用班级邀请码，之后用学号和密码登录。
- 动态首页：展示班级学习打卡、日常分享、点赞和评论。
- 学习打卡：记录自定义学科、学习时长、知识点心得和话题标签。
- 日常分享：发布班级生活、校园瞬间和普通动态。
- 个人主页：查看个人资料、发布记录和学习统计。
- 模块中心：维护者可以启用、停用和配置班级模块。
- 模块运行时：模块拥有独立存储、错误隔离、页面入口和首页组件。
- 算法挑战模块：提供洛谷题目推荐，并记录个人完成状态。
- 资料库模块：同学可以分享学习资料链接、说明和标签。

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- lucide-react
- Prisma
- PostgreSQL
- bcryptjs
- ESLint

## 快速开始

### 环境要求

建议使用 Node.js 20 或更高版本。

### 安装依赖

```bash
npm install
```

### 配置数据库

复制环境变量模板：

```bash
cp .env.example .env
```

在 `.env` 中填写 PostgreSQL 连接字符串：

```text
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
SESSION_SECRET="replace-with-a-long-random-secret"
```

推荐在 Vercel Marketplace 创建 Prisma Postgres，并把 `DATABASE_URL` 绑定到项目。

### 初始化数据库

```bash
npm run db:deploy
npm run db:seed
```

seed 会创建演示班级、示例用户、帖子、评论、资料库和默认模块状态。示例用户初始密码为：

```text
123456
```

### 启动开发服务

```bash
npm run dev
```

启动后访问：

```text
http://localhost:3000
```

演示邀请码：

```text
QINGCHUN26
```

### 代码检查

```bash
npm run lint
npx tsc --noEmit
```

### 生产构建

```bash
npm run build
```

### 启动生产服务

```bash
npm run start
```

## 项目结构

```text
app/
  globals.css              全局样式
  layout.tsx               Next.js 根布局
  page.tsx                 应用入口页面

components/
  app-shell.tsx            主应用界面和核心交互
  modules/
    module-center.tsx      模块中心
    module-icon.tsx        模块图标映射
    module-runtime.tsx     模块运行容器和错误隔离

lib/
  data.ts                  演示数据和默认模块状态
  types.ts                 核心业务类型
  server/                  Prisma、认证和序列化工具
  modules/
    registry.ts            模块注册表
    sdk.ts                 模块 SDK 类型和工具函数
    storage.ts             模块独立存储
    use-module-value.ts    模块状态同步 Hook

modules/
  _template/               模块开发模板
  algorithm-challenge/     算法挑战模块
  resource-library/        资料库模块

prisma/
  schema.prisma            数据库模型
  seed.ts                  演示数据初始化脚本
  migrations/              数据库迁移 SQL

docs/
  module-development.md    模块开发指南
```

## 模块开发

班级模块是随主站一起构建发布的 TypeScript 功能包。每个模块需要导出一个 `ClassModule` 对象，包含模块清单、页面组件和可选首页组件。

最小模块目录：

```text
modules/
  your-module/
    index.tsx
```

新增模块后，需要在 `lib/modules/registry.ts` 中导入并加入 `moduleRegistry`。

模块开发流程：

1. 从 `modules/_template/index.tsx` 复制模板。
2. 修改模块 ID、名称、描述、作者和版本号。
3. 按需申请权限，例如读取当前用户、读取班级信息、使用模块存储。
4. 使用 `context.storage` 保存模块自己的数据。
5. 在 `lib/modules/registry.ts` 注册模块。
6. 运行 `npm run lint` 和 `npm run build`。
7. 提交分支或 Pull Request，由维护者审核后合并。

更详细说明见 [docs/module-development.md](docs/module-development.md)。

## 数据说明

当前项目使用浏览器 `localStorage` 保存演示数据：

- 用户信息
- 班级信息
- 动态和评论
- 模块启用状态
- 模块独立数据

这意味着数据只保存在当前浏览器中，换设备或清除浏览器数据后会丢失。后续如果要用于真实班级，需要接入后端数据库和登录系统。

## 部署建议

推荐优先部署到 Vercel：

1. 将代码推送到 GitHub。
2. 在 Vercel 中导入该仓库。
3. 构建命令保持为 `npm run build`。
4. 生产分支选择 `main`。
5. 每次推送到 `main` 后自动部署。

如果使用 Node.js 服务器部署，可以执行：

```bash
npm install
npm run build
npm run start
```

## 开发流程建议

建议采用 GitHub Flow：

1. `main` 分支保持可运行、可构建。
2. 新功能从 `main` 创建独立分支。
3. 完成后运行 `npm run lint` 和 `npm run build`。
4. 提交 Pull Request。
5. 经过代码审查后合并。
6. 由部署平台自动发布预览或生产环境。

## 后续计划

- 接入真实登录和权限系统。
- 将 `localStorage` 数据迁移到数据库。
- 支持真实图片上传。
- 增加管理员后台和班级成员管理。
- 增加 GitHub Actions 自动检查。
- 增加 Playwright 端到端测试。
- 完善模块审核、版本升级和回滚流程。
- 增加更多班级工具模块，例如作业清单、资料库、活动报名等。

## 当前状态

项目已经完成前端原型、核心交互和模块机制。适合用于课程展示、功能演示和后续迭代开发；如果要正式上线，需要补齐后端、鉴权、安全校验和自动化测试。
