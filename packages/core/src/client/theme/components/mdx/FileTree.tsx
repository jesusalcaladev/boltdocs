import React, { Children, isValidElement, useState } from "react";
import {
  Folder,
  FileText,
  File,
  FileCode,
  FileImage,
  ChevronRight,
} from "lucide-react";

export interface FileTreeProps {
  children: React.ReactNode;
}

function getTextContent(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return node.toString();
  if (Array.isArray(node)) return node.map(getTextContent).join("");
  if (isValidElement(node)) {
    return getTextContent((node.props as any).children);
  }
  return "";
}

function getFileIcon(filename: string) {
  const name = filename.toLowerCase();

  if (
    name.endsWith(".ts") ||
    name.endsWith(".tsx") ||
    name.endsWith(".js") ||
    name.endsWith(".jsx") ||
    name.endsWith(".json") ||
    name.endsWith(".mjs") ||
    name.endsWith(".cjs") ||
    name.endsWith(".astro") ||
    name.endsWith(".vue") ||
    name.endsWith(".svelte")
  ) {
    return (
      <FileCode size={16} strokeWidth={2} className="ld-file-tree__icon-file" />
    );
  }

  if (name.endsWith(".md") || name.endsWith(".mdx") || name.endsWith(".txt")) {
    return (
      <FileText size={16} strokeWidth={2} className="ld-file-tree__icon-file" />
    );
  }

  if (
    name.endsWith(".png") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".svg") ||
    name.endsWith(".gif")
  ) {
    return (
      <FileImage
        size={16}
        strokeWidth={2}
        className="ld-file-tree__icon-file"
      />
    );
  }

  return <File size={16} strokeWidth={2} className="ld-file-tree__icon-file" />;
}

// Helper to reliably check for ul and li elements, including MDX wrappers
function isListElement(node: any, tag: "ul" | "li"): boolean {
  if (typeof node.type === "string") {
    return node.type === tag;
  }
  if (typeof node.type === "function") {
    return node.type.name === tag || node.type.name?.toLowerCase() === tag;
  }
  // MDX specific wrapper detection
  if (node.props && node.props.originalType === tag) {
    return true;
  }
  if (node.props && node.props.mdxType === tag) {
    return true;
  }
  return false;
}

function FolderNode({
  labelText,
  nestedNodes,
  depth,
}: {
  labelText: string;
  nestedNodes: React.ReactNode[];
  depth: number;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <li className="ld-file-tree__item">
      <div
        className="ld-file-tree__label ld-file-tree__label--folder"
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: "pointer" }}
      >
        <span className="ld-file-tree__icon ld-file-tree__icon--chevron">
          <ChevronRight
            size={14}
            className={`ld-file-tree__chevron ${isOpen ? "ld-file-tree__chevron--open" : ""}`}
            strokeWidth={3}
          />
        </span>
        <span className="ld-file-tree__icon">
          <Folder
            size={16}
            strokeWidth={2}
            className="ld-file-tree__icon-folder"
            fill="currentColor"
            fillOpacity={0.15}
          />
        </span>
        <span className="ld-file-tree__name">{labelText}</span>
      </div>
      {isOpen && nestedNodes.length > 0 && (
        <div className="ld-file-tree__nested">
          {nestedNodes.map((child, index) => (
            <React.Fragment key={index}>
              {parseNode(child, depth)}
            </React.Fragment>
          ))}
        </div>
      )}
    </li>
  );
}

function parseNode(node: React.ReactNode, depth: number = 0): React.ReactNode {
  if (!isValidElement(node)) {
    return node;
  }

  if (isListElement(node, "ul")) {
    return (
      <ul
        className={`ld-file-tree__list ${depth === 0 ? "ld-file-tree__list--root" : ""}`}
      >
        {Children.map((node.props as any).children, (child, index) => (
          <React.Fragment key={index}>
            {parseNode(child, depth + 1)}
          </React.Fragment>
        ))}
      </ul>
    );
  }

  if (isListElement(node, "li")) {
    const children = Children.toArray((node.props as any).children);

    // Find nested list indicating a directory
    const nestedListIndex = children.findIndex(
      (child) => isValidElement(child) && isListElement(child, "ul"),
    );
    const hasNested = nestedListIndex !== -1;

    // Separate text label from nested items
    const labelNodes = hasNested
      ? children.slice(0, nestedListIndex)
      : children;
    const nestedNodes = hasNested ? children.slice(nestedListIndex) : [];

    const rawLabelContent = getTextContent(labelNodes).trim();
    const isExplicitDir = rawLabelContent.endsWith("/");
    const labelText = isExplicitDir
      ? rawLabelContent.slice(0, -1)
      : rawLabelContent;

    const isFolder = hasNested || isExplicitDir;

    if (isFolder) {
      return (
        <FolderNode
          labelText={labelText}
          nestedNodes={nestedNodes}
          depth={depth}
        />
      );
    }

    return (
      <li className="ld-file-tree__item">
        <div className="ld-file-tree__label ld-file-tree__label--file">
          <span className="ld-file-tree__icon ld-file-tree__icon--spacer"></span>
          <span className="ld-file-tree__icon">{getFileIcon(labelText)}</span>
          <span className="ld-file-tree__name">{labelText}</span>
        </div>
      </li>
    );
  }

  // If node is e.g. a paragraph injected by MDX wrapping the list
  if ((node.props as any).children) {
    return Children.map((node.props as any).children, (child, index) => (
      <React.Fragment key={index}>{parseNode(child, depth)}</React.Fragment>
    ));
  }

  return node;
}

/**
 * FileTree component displays a customized, styled tree structure for markdown lists.
 *
 * ```mdx
 * <FileTree>
 * - src/
 *   - index.ts
 *   - components/
 *     - Button.tsx
 * - package.json
 * </FileTree>
 * ```
 */
export function FileTree({ children }: FileTreeProps) {
  return (
    <div className="ld-file-tree" dir="ltr">
      {Children.map(children, (child) => parseNode(child, 0))}
    </div>
  );
}
