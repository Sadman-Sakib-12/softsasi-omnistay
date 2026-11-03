'use client';

import React, { useState } from 'react';
import { TiptapEditor } from './tiptap-editor';
import { EditorJsEditor } from './editorjs-editor';
import { Code2, Edit3, LayoutGrid } from 'lucide-react';

export type EditorMode = 'tiptap' | 'editorjs' | 'markdown';

export interface UnifiedRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: string;
}

export function UnifiedRichEditor({
  value,
  onChange,
  label = 'Content Editor',
  placeholder = 'Write or design your page content here...',
}: UnifiedRichEditorProps) {
  const [mode, setMode] = useState<EditorMode>('tiptap');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between pb-1">
        <label className="block text-slate-700 font-semibold text-xs">{label}</label>

        {/* Engine Switcher: Tiptap vs Editor.js vs Markdown */}
        <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-100 text-xs">
          <button
            type="button"
            onClick={() => setMode('tiptap')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              mode === 'tiptap'
                ? 'bg-white shadow-2xs text-[#00a8ff]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Tiptap Rich WYSIWYG Editor"
          >
            <Edit3 className="w-3 h-3" />
            <span>Tiptap</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('editorjs')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              mode === 'editorjs'
                ? 'bg-white shadow-2xs text-[#92003b]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Editor.js Structured Block Editor"
          >
            <LayoutGrid className="w-3 h-3" />
            <span>Editor.js</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('markdown')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              mode === 'markdown'
                ? 'bg-white shadow-2xs text-slate-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Raw Markdown / HTML Source"
          >
            <Code2 className="w-3 h-3" />
            <span>Raw Code</span>
          </button>
        </div>
      </div>

      {mode === 'tiptap' && (
        <TiptapEditor
          content={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      )}

      {mode === 'editorjs' && (
        <EditorJsEditor
          initialData={value}
          onChange={(output) => {
            // Store as stringified JSON or HTML block representation
            try {
              onChange(JSON.stringify(output));
            } catch {
              // ignore
            }
          }}
          placeholder={placeholder}
        />
      )}

      {mode === 'markdown' && (
        <textarea
          rows={10}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 font-mono text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#00a8ff] leading-relaxed"
        />
      )}
    </div>
  );
}

