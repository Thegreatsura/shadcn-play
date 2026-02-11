"use client";

import { useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IconCopy, IconCheck, IconWand } from "@tabler/icons-react";
import type { TranspileError } from "@/lib/playground/transpile";
import type { editor } from "monaco-editor";

export const DEFAULT_TSX_CODE = `import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CardWithForm() {
  return (
    <div className="flex min-h-screen items-center justify-center">
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>
          Deploy your new project in one-click.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Name of your project"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="framework">Framework</Label>
              <Select>
                <SelectTrigger id="framework">
                  <SelectValue
                    placeholder="Select"
                  />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="next">
                    Next.js
                  </SelectItem>
                  <SelectItem value="sveltekit">
                    SvelteKit
                  </SelectItem>
                  <SelectItem value="astro">
                    Astro
                  </SelectItem>
                  <SelectItem value="nuxt">
                    Nuxt.js
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
    </div>
  )
}`;

interface EditorPanelProps {
  code: string;
  onCodeChange: (code: string) => void;
  error?: TranspileError | null;
}

export function EditorPanel({ code, onCodeChange, error }: EditorPanelProps) {
  const { resolvedTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const editorRef = useCallback(
    (editorInstance: editor.IStandaloneCodeEditor | null) => {
      if (!editorInstance) return;
      const model = editorInstance.getModel();
      if (!model) return;

      if (error) {
        const monaco = (window as unknown as { monaco: typeof import("monaco-editor") }).monaco;
        if (monaco) {
          monaco.editor.setModelMarkers(model, "playground", [
            {
              startLineNumber: error.line,
              startColumn: error.column + 1,
              endLineNumber: error.line,
              endColumn: model.getLineMaxColumn(error.line),
              message: error.message,
              severity: monaco.MarkerSeverity.Error,
            },
          ]);
        }
      } else {
        const monaco = (window as unknown as { monaco: typeof import("monaco-editor") }).monaco;
        if (monaco) {
          monaco.editor.setModelMarkers(model, "playground", []);
        }
      }
    },
    [error],
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border px-3">
        <span className="text-xs text-muted-foreground">component.tsx</span>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleCopy}
                aria-label="Copy code"
              >
                {copied ? (
                  <IconCheck className="size-3.5 text-emerald-500" />
                ) : (
                  <IconCopy className="size-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy code</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Format code"
              >
                <IconWand className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Format</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language="typescript"
          theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
          value={code}
          onChange={(value) => onCodeChange(value ?? "")}
          onMount={(instance) => editorRef(instance)}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "var(--font-geist-mono), monospace",
            lineHeight: 20,
            padding: { top: 12 },
            scrollBeyondLastLine: false,
            renderLineHighlight: "none",
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
            wordWrap: "on",
            tabSize: 2,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
