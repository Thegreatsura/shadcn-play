import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { execFileSync } from "child_process";
import {
  buildShadcnExamplesIndex,
  readRawExampleFiles,
} from "../lib/playground/shadcn-examples-index";

const REPO_URL = "https://github.com/shadcn-ui/ui.git";
const EXAMPLES_RELATIVE_DIR = "apps/v4/examples/base";
const OUTPUT_PATH = join(
  process.cwd(),
  "public",
  "playground",
  "shadcn-examples.json",
);

function run() {
  const workspace = mkdtempSync(join(tmpdir(), "shadcn-ui-"));
  const cloneDir = join(workspace, "ui");

  try {
    console.log("Cloning shadcn/ui (depth=1)...");
    execFileSync("git", ["clone", "--depth", "1", REPO_URL, cloneDir], {
      stdio: "pipe",
    });

    const examplesDir = join(cloneDir, EXAMPLES_RELATIVE_DIR);
    const files = readRawExampleFiles(examplesDir);
    const { index, warnings } = buildShadcnExamplesIndex(files);

    mkdirSync(join(process.cwd(), "public", "playground"), { recursive: true });
    writeFileSync(OUTPUT_PATH, `${JSON.stringify(index, null, 2)}\n`, "utf-8");

    console.log(
      `Wrote ${index.components.length} components to public/playground/shadcn-examples.json`,
    );

    if (warnings.length > 0) {
      console.warn(`Generated with ${warnings.length} warning(s):`);
      for (const warning of warnings) {
        console.warn(`- ${warning}`);
      }
    }
  } catch (error) {
    console.error("Failed to sync shadcn examples.");
    throw error;
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
}

run();
