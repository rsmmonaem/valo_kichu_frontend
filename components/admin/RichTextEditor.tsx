"use client";

import React, { useEffect, useRef, useCallback } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const TOOLBAR_BUTTONS = [
  { cmd: "bold", icon: "B", title: "Bold", style: "font-bold" },
  { cmd: "italic", icon: "I", title: "Italic", style: "italic" },
  { cmd: "underline", icon: "U", title: "Underline", style: "underline" },
  { cmd: "strikeThrough", icon: "S̶", title: "Strikethrough", style: "" },
];

const BLOCK_FORMATS = [
  { cmd: "formatBlock", val: "p", label: "Paragraph" },
  { cmd: "formatBlock", val: "h2", label: "Heading 2" },
  { cmd: "formatBlock", val: "h3", label: "Heading 3" },
  { cmd: "formatBlock", val: "h4", label: "Heading 4" },
];

const LIST_BUTTONS = [
  { cmd: "insertUnorderedList", icon: "≡", title: "Bullet List" },
  { cmd: "insertOrderedList", icon: "№", title: "Numbered List" },
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Type here...",
  minHeight = "180px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Sync external value → editor (only when not typing)
  useEffect(() => {
    const el = editorRef.current;
    if (!el || isInternalUpdate.current) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || "";
    }
  }, [value]);

  const exec = useCallback((cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    handleChange();
  }, []);

  const handleChange = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    isInternalUpdate.current = true;
    onChange(el.innerHTML);
    setTimeout(() => {
      isInternalUpdate.current = false;
    }, 0);
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      exec("insertHTML", "&nbsp;&nbsp;&nbsp;&nbsp;");
    }
  };

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200">
        {/* Block format selector */}
        <select
          onMouseDown={(e) => e.preventDefault()}
          onChange={(e) => exec("formatBlock", e.target.value)}
          className="text-xs px-2 py-1.5 bg-white border border-gray-200 rounded-md focus:outline-none cursor-pointer text-gray-700 hover:border-gray-400 transition-colors"
        >
          {BLOCK_FORMATS.map((f) => (
            <option key={f.val} value={f.val}>
              {f.label}
            </option>
          ))}
        </select>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Bold / Italic / Underline / Strike */}
        {TOOLBAR_BUTTONS.map((btn) => (
          <button
            key={btn.cmd}
            type="button"
            title={btn.title}
            onMouseDown={(e) => {
              e.preventDefault();
              exec(btn.cmd);
            }}
            className={`w-8 h-8 flex items-center justify-center text-sm rounded-md hover:bg-blue-100 hover:text-blue-700 text-gray-700 transition-colors ${btn.style}`}
          >
            {btn.icon}
          </button>
        ))}

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Lists */}
        {LIST_BUTTONS.map((btn) => (
          <button
            key={btn.cmd}
            type="button"
            title={btn.title}
            onMouseDown={(e) => {
              e.preventDefault();
              exec(btn.cmd);
            }}
            className="w-8 h-8 flex items-center justify-center text-base rounded-md hover:bg-blue-100 hover:text-blue-700 text-gray-700 transition-colors"
          >
            {btn.icon}
          </button>
        ))}

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Link */}
        <button
          type="button"
          title="Insert Link"
          onMouseDown={(e) => {
            e.preventDefault();
            const url = prompt("Enter URL:", "https://");
            if (url) exec("createLink", url);
          }}
          className="w-8 h-8 flex items-center justify-center text-sm rounded-md hover:bg-blue-100 hover:text-blue-700 text-gray-700 transition-colors"
        >
          🔗
        </button>

        {/* Clear */}
        <button
          type="button"
          title="Remove Formatting"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("removeFormat");
          }}
          className="w-8 h-8 flex items-center justify-center text-sm rounded-md hover:bg-red-100 hover:text-red-600 text-gray-700 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleChange}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className={`
          px-4 py-3 text-sm text-gray-800 leading-relaxed focus:outline-none
          [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-2 [&_h2]:text-gray-900
          [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-gray-800
          [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mt-2 [&_h4]:mb-1
          [&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-2
          [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-2
          [&_a]:text-blue-600 [&_a]:underline
          [&_strong]:font-bold [&_b]:font-bold
          empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none
        `}
      />
    </div>
  );
}
