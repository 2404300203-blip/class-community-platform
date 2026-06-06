"use client";

import type { ClassModule, ModulePageProps } from "@/lib/modules/sdk";

function TemplatePage({ context }: ModulePageProps) {
  return (
    <section className="card rounded-[24px] p-6">
      <h2 className="text-xl font-extrabold">新模块</h2>
      <p className="mt-2 text-sm text-slate-500">
        你好，{context.currentUser.name}。从这里开始制作班级的新功能。
      </p>
    </section>
  );
}

const templateModule: ClassModule = {
  manifest: {
    id: "replace-with-unique-id",
    name: "新模块",
    description: "说明模块解决的问题。",
    author: "你的名字",
    version: "1.0.0",
    icon: "puzzle",
    navigation: { label: "新模块", order: 100 },
    permissions: ["read:current-user"],
    settingsSchema: [],
  },
  Page: TemplatePage,
};

export default templateModule;
