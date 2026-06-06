# 班级模块开发指南

班级模块是随主站构建发布的 TypeScript 功能包。模块通过受控 SDK 获取当前用户、班级公开信息、独立存储、页面导航和通知能力，不能直接修改主站帖子、用户或评论数据。

## 目录约定

```text
modules/
  your-module/
    index.tsx
```

完成模块后，在 `lib/modules/registry.ts` 中静态导入并加入 `moduleRegistry`。模块 ID 必须唯一，版本必须使用语义化版本格式，例如 `1.2.0`。

## 最小模块

```tsx
"use client";

import type { ClassModule, ModulePageProps } from "@/lib/modules/sdk";

function Page({ context }: ModulePageProps) {
  return (
    <button onClick={() => context.notify("模块运行成功")}>
      你好，{context.currentUser.name}
    </button>
  );
}

const module: ClassModule = {
  manifest: {
    id: "your-module",
    name: "模块名称",
    description: "一句话说明模块解决的问题。",
    author: "作者或小组",
    version: "1.0.0",
    icon: "puzzle",
    navigation: { label: "模块名称", order: 20 },
    permissions: ["read:current-user"],
    settingsSchema: [],
  },
  Page,
};

export default module;
```

## 数据存储

使用 `context.storage.get/set/remove`。存储键会自动按模块 ID 和当前用户隔离，不要直接操作主站的 `localStorage` 键。

```ts
const records = context.storage.get<string[]>("records", []);
context.storage.set("records", [...records, "new record"]);
```

需要页面与首页组件实时同步时，使用 `useModuleValue`：

```ts
const [records, setRecords] = useModuleValue(
  context.storage,
  "records",
  [] as string[],
);
```

## 提交流程

1. 从 `modules/_template/index.tsx` 复制模板并修改模块 ID。
2. 只申请实际使用的权限，补充配置项默认值。
3. 在注册表中加入模块，运行 `npm run lint` 和 `npm run build`。
4. 提交 Git 分支与 PR，说明功能、权限、数据键和测试方式。
5. 维护者审核合并并部署后，在模块中心启用。

模块不得加载未经审核的远程脚本、读取其他模块存储或绕过 SDK 修改核心数据。
