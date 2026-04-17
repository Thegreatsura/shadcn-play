import { compile } from "tailwindcss";
// @ts-expect-error -- esbuild inlines these as text via loader config
import indexCss from "tailwindcss/index.css";
// @ts-expect-error -- esbuild inlines these as text via loader config
import preflightCss from "tailwindcss/preflight.css";
// @ts-expect-error -- esbuild inlines these as text via loader config
import themeCss from "tailwindcss/theme.css";
// @ts-expect-error -- esbuild inlines these as text via loader config
import utilitiesCss from "tailwindcss/utilities.css";
// @ts-expect-error -- esbuild inlines these as text via loader config
import twAnimateCss from "tw-animate-css";
// @ts-expect-error -- esbuild inlines these as text via loader config
import shadcnTailwindCss from "shadcn/tailwind.css";
import { TAILWIND_THEME_CONFIG } from "./tailwind-stylesheets";

type CompileRequest = { type: "compile"; candidates: string[]; id: number };
type CompileResponse = { type: "css"; css: string; id: number };
type ReadyMessage = { type: "ready" };
type ErrorMessage = { type: "error"; message: string; id?: number };

const themeConfig = TAILWIND_THEME_CONFIG;

const stylesheets: Record<string, string> = {
  tailwindcss: indexCss,
  "tailwindcss/preflight": preflightCss,
  "tailwindcss/theme": themeCss,
  "tailwindcss/utilities": utilitiesCss,
  "tw-animate-css": twAnimateCss,
  "shadcn/tailwind.css": shadcnTailwindCss,
};

let compiler: Awaited<ReturnType<typeof compile>> | null = null;
let previousClasses: string[] = [];
let previousCss = "";

async function init() {
  compiler = await compile(themeConfig, {
    base: "/",
    loadStylesheet: async (id: string, base: string) => {
      const content = stylesheets[id];
      if (!content) throw new Error(`Unknown stylesheet: ${id}`);
      return { path: id, base, content };
    },
    loadModule: async () => {
      throw new Error("Loading modules is not supported in the playground");
    },
  });
}

self.onmessage = async (e: MessageEvent<CompileRequest>) => {
  if (e.data.type !== "compile") return;

  const { candidates, id } = e.data;

  try {
    if (!compiler) {
      throw new Error("Compiler not initialized");
    }

    if (
      candidates.length > 0 &&
      candidates.every((c) => previousClasses.includes(c))
    ) {
      self.postMessage({
        type: "css",
        css: previousCss,
        id,
      } satisfies CompileResponse);
      return;
    }

    const css = compiler.build(candidates);
    previousClasses = candidates;
    previousCss = css;
    self.postMessage({ type: "css", css, id } satisfies CompileResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    self.postMessage({ type: "error", message, id } satisfies ErrorMessage);
  }
};

init()
  .then(() => {
    self.postMessage({ type: "ready" } satisfies ReadyMessage);
  })
  .catch((err) => {
    const message = err instanceof Error ? err.message : String(err);
    self.postMessage({ type: "error", message } satisfies ErrorMessage);
  });
