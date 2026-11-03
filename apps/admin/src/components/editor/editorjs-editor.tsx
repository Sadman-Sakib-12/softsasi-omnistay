'use client';

import React, { useEffect, useRef, useState } from 'react';
import type EditorJS from '@editorjs/editorjs';
import type { OutputData } from '@editorjs/editorjs';

export interface EditorJsEditorProps {
  holderId?: string;
  initialData?: OutputData | string;
  onChange?: (data: OutputData) => void;
  placeholder?: string;
  className?: string;
}

export function EditorJsEditor({
  holderId = 'editorjs-container',
  initialData,
  onChange,
  placeholder = 'Click here or press Tab to write structured blocks with Editor.js...',
  className = '',
}: EditorJsEditorProps) {
  const editorInstance = useRef<EditorJS | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initEditor() {
      if (typeof window === 'undefined') return;

      try {
        const EditorJSClass = (await import('@editorjs/editorjs')).default;
        const Header = (await import('@editorjs/header')).default;
        const List = (await import('@editorjs/list')).default;
        const Paragraph = (await import('@editorjs/paragraph')).default;

        let parsedData: OutputData | undefined = undefined;
        if (typeof initialData === 'string' && initialData.trim()) {
          try {
            parsedData = JSON.parse(initialData);
          } catch {
            // If it's plain text or HTML, convert to basic paragraph block
            parsedData = {
              time: Date.now(),
              blocks: [
                {
                  type: 'paragraph',
                  data: {
                    text: initialData,
                  },
                },
              ],
            };
          }
        } else if (typeof initialData === 'object' && initialData !== null) {
          parsedData = initialData;
        }

        if (editorInstance.current) {
          try {
            await editorInstance.current.isReady;
            editorInstance.current.destroy();
          } catch {
            // ignore
          }
          editorInstance.current = null;
        }

        const editor = new EditorJSClass({
          holder: holderId,
          placeholder,
          data: parsedData,
          tools: {
            header: {
              class: Header as any,
              inlineToolbar: ['link', 'bold', 'italic'],
              config: {
                placeholder: 'Header',
                levels: [2, 3, 4],
                defaultLevel: 2,
              },
            },
            list: {
              class: List as any,
              inlineToolbar: true,
            },
            paragraph: {
              class: Paragraph as any,
              inlineToolbar: true,
            },
          },
          onChange: async () => {
            if (onChange && editorInstance.current) {
              try {
                const output = await editorInstance.current.save();
                onChange(output);
              } catch (err) {
                console.error('Error saving Editor.js content:', err);
              }
            }
          },
          onReady: () => {
            if (isMounted) {
              setIsReady(true);
            }
          },
        });

        editorInstance.current = editor;
      } catch (err) {
        console.error('Failed to initialize Editor.js:', err);
      }
    }

    initEditor();

    return () => {
      isMounted = false;
      if (editorInstance.current && typeof editorInstance.current.destroy === 'function') {
        try {
          editorInstance.current.destroy();
        } catch {
          // ignore cleanup issues
        }
        editorInstance.current = null;
      }
    };
  }, [holderId]);

  return (
    <div className={`border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs ${className}`}>
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200 text-xs">
        <span className="font-bold text-slate-700 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Editor.js Block Workspace
        </span>
        <span className="text-[11px] text-slate-400">
          {isReady ? 'Ready · Press Tab for blocks menu' : 'Initializing Editor.js...'}
        </span>
      </div>
      <div className="p-4 min-h-[180px] bg-white text-slate-800">
        <div id={holderId} className="prose prose-sm max-w-none text-xs sm:text-sm" />
      </div>
    </div>
  );
}
