import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import {
  type HighlighterCore,
  type RegexEngine,
  createHighlighterCore,
} from "shiki/core";

// Themes:
import githubLight from "@shikijs/themes/github-light";
import githubDark from "@shikijs/themes/github-dark";

// Languages:
import html from "@shikijs/langs/html";
import js from "@shikijs/langs/js";
import ts from "@shikijs/langs/ts";
import tsx from "@shikijs/langs/tsx";
import css from "@shikijs/langs/css";
import json from "@shikijs/langs/json";
import bash from "@shikijs/langs/bash";
import markdown from "@shikijs/langs/markdown";
import mdx from "@shikijs/langs/mdx";
import yaml from '@shikijs/langs/yaml'

let jsEngine: RegexEngine | null = null;
let highlighter: Promise<HighlighterCore> | null = null;

const ThemesDefault = {
  light: "github-light",
  dark: "github-dark",
};

type Languages = "html" | "js" | "ts" | "tsx" | "css" | "bash" | "json" | "markdown" | "mdx" | "yaml";

const getJsEngine = (): RegexEngine => {
  jsEngine ??= createJavaScriptRegexEngine();
  return jsEngine;
};

const highlight = async (codeTheme: any): Promise<HighlighterCore> => {
  if (highlighter) return highlighter;

  highlighter = createHighlighterCore({
    themes: [
      (githubLight as any).default || githubLight,
      (githubDark as any).default || githubDark,
    ],
    langs: [
      bash, 
      js, 
      ts, 
      tsx, 
      css, 
      markdown, 
      mdx, 
      html, 
      json, 
      yaml
    ],
    engine: getJsEngine(),
  });

  return highlighter;
};

export { highlight, type Languages };
