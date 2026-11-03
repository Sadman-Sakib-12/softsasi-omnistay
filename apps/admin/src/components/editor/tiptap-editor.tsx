'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Code,
  Minus,
} from 'lucide-react';

export interface TiptapEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export function TiptapEditor({
  content = '',
  onChange,
  className = '',
  editable = true,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content,
    editable,
    immediatelyRender: false, // Prevents SSR hydration mismatch in Next.js
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none min-h-[160px] p-3 text-slate-800 font-sans text-xs sm:text-sm leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) {
    return (
      <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 text-xs text-slate-400">
        Loading Tiptap Editor...
      </div>
    );
  }

  return (
    <div className={`border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs ${className}`}>
      {/* Tiptap Formatting Toolbar */}
      {editable && (
        <div className="flex flex-wrap items-center gap-1 p-1.5 bg-slate-50 border-b border-slate-200 text-slate-700">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded transition ${
              editor.isActive('bold')
                ? 'bg-sky-100 text-[#00a8ff] font-bold'
                : 'hover:bg-slate-200/70 text-slate-600'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded transition ${
              editor.isActive('italic')
                ? 'bg-sky-100 text-[#00a8ff]'
                : 'hover:bg-slate-200/70 text-slate-600'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded transition ${
              editor.isActive('strike')
                ? 'bg-sky-100 text-[#00a8ff]'
                : 'hover:bg-slate-200/70 text-slate-600'
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded transition ${
              editor.isActive('code')
                ? 'bg-sky-100 text-[#00a8ff]'
                : 'hover:bg-slate-200/70 text-slate-600'
            }`}
            title="Inline Code"
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-0.5" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded transition ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-sky-100 text-[#00a8ff] font-bold'
                : 'hover:bg-slate-200/70 text-slate-600'
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded transition ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-sky-100 text-[#00a8ff] font-bold'
                : 'hover:bg-slate-200/70 text-slate-600'
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded transition ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-sky-100 text-[#00a8ff] font-bold'
                : 'hover:bg-slate-200/70 text-slate-600'
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-0.5" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded transition ${
              editor.isActive('bulletList')
                ? 'bg-sky-100 text-[#00a8ff]'
                : 'hover:bg-slate-200/70 text-slate-600'
            }`}
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded transition ${
              editor.isActive('orderedList')
                ? 'bg-sky-100 text-[#00a8ff]'
                : 'hover:bg-slate-200/70 text-slate-600'
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded transition ${
              editor.isActive('blockquote')
                ? 'bg-sky-100 text-[#00a8ff]'
                : 'hover:bg-slate-200/70 text-slate-600'
            }`}
            title="Blockquote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1.5 rounded hover:bg-slate-200/70 text-slate-600 transition"
            title="Horizontal Divider"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-0.5" />

          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded hover:bg-slate-200/70 text-slate-600 disabled:opacity-30 transition"
            title="Undo"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded hover:bg-slate-200/70 text-slate-600 disabled:opacity-30 transition"
            title="Redo"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editor Surface */}
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

