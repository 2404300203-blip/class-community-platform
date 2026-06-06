import {
  Blocks,
  Braces,
  Code2,
  FolderGit2,
  Library,
  Puzzle,
  Terminal,
} from "lucide-react";
import type { ModuleIcon as ModuleIconName } from "@/lib/modules/sdk";

const icons = {
  blocks: Blocks,
  braces: Braces,
  "code-2": Code2,
  "folder-git-2": FolderGit2,
  library: Library,
  puzzle: Puzzle,
  terminal: Terminal,
};

export function ModuleIcon({
  name,
  size = 18,
  className,
}: {
  name: ModuleIconName;
  size?: number;
  className?: string;
}) {
  const Icon = icons[name];
  return <Icon size={size} className={className} />;
}
