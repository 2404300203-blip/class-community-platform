import algorithmChallenge from "@/modules/algorithm-challenge";
import type { ClassModule } from "./sdk";

const SEMVER_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

function validateRegistry(modules: ClassModule[]) {
  const ids = new Set<string>();
  for (const classModule of modules) {
    const { manifest } = classModule;
    if (
      !manifest.id ||
      !manifest.name ||
      !manifest.description ||
      !manifest.author ||
      !manifest.navigation?.label
    ) {
      throw new Error("模块清单缺少必填字段");
    }
    if (ids.has(manifest.id)) {
      throw new Error(`模块 ID 重复：${manifest.id}`);
    }
    if (!SEMVER_PATTERN.test(manifest.version)) {
      throw new Error(
        `模块 ${manifest.id} 的版本号不符合语义化版本规范：${manifest.version}`,
      );
    }
    ids.add(manifest.id);
  }
  return modules.sort(
    (a, b) => a.manifest.navigation.order - b.manifest.navigation.order,
  );
}

export const moduleRegistry = validateRegistry([algorithmChallenge]);

export function getModuleById(moduleId: string) {
  return moduleRegistry.find((module) => module.manifest.id === moduleId);
}
