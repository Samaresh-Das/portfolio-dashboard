import { useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";

/**
 * RICH TEXT EDITOR (src/components/ui/RichTextEditor.tsx)
 *
 * A lightweight RTE built on `contenteditable` — no external deps.
 * Supports basic formatting: Bold, Italic, Underline, Strikethrough,
 * Bullet List, Ordered List, and Heading.
 *
 * PROPS:
 * - value: HTML string content to display (used for initial load only).
 * - onChange: Callback fired with the innerHTML on every input event.
 * - placeholder: Ghost text shown when the editor is empty.
 *
 * IMPORTANT: We do NOT re-render the contentEditable div on every keystroke.
 * Instead, we set the initial HTML once via a ref, and only sync outward
 * via onChange. This prevents the cursor-jump / backwards-text bug.
 */

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const toolbarButtons = [
  { command: "bold", icon: "B", title: "Bold", style: { fontWeight: 700 } as React.CSSProperties },
  { command: "italic", icon: "I", title: "Italic", style: { fontStyle: "italic" } as React.CSSProperties },
  { command: "underline", icon: "U", title: "Underline", style: { textDecoration: "underline" } as React.CSSProperties },
  { command: "strikeThrough", icon: "S", title: "Strikethrough", style: { textDecoration: "line-through" } as React.CSSProperties },
  { command: "insertUnorderedList", icon: "•", title: "Bullet List", style: {} as React.CSSProperties },
  { command: "insertOrderedList", icon: "1.", title: "Ordered List", style: {} as React.CSSProperties },
];

const RichTextEditor = ({ value, onChange, placeholder = "Write a detailed description..." }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  /**
   * Track whether the initial value has been loaded into the editor.
   * We only set innerHTML from the `value` prop ONCE — on mount or when
   * the value changes externally (e.g., opening an edit modal with existing data).
   */
  const lastExternalValue = useRef<string>(value);

  /**
   * EFFECT: Sync external value changes into the editor.
   * This fires when:
   * - Component first mounts (initial load).
   * - Parent resets the value (e.g., clearing form, opening edit modal).
   * We compare against `lastExternalValue` to avoid overwriting user typing.
   */
  useEffect(() => {
    if (editorRef.current && value !== lastExternalValue.current) {
      editorRef.current.innerHTML = value;
      lastExternalValue.current = value;
    }
  }, [value]);

  /**
   * Execute a formatting command on the selected text.
   * Uses document.execCommand which is simple and widely supported.
   * We prevent default to stop focus loss from the toolbar button click.
   */
  const execCommand = useCallback((command: string) => {
    document.execCommand(command, false);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      lastExternalValue.current = html;
      onChange(html);
    }
  }, [onChange]);

  /**
   * Handle heading toggle: wraps selection in the specified heading tag.
   * If already that heading level, reverts to <p>.
   */
  const toggleHeading = useCallback((level: string) => {
    const selection = window.getSelection();
    const tag = level.toUpperCase(); // e.g. "H1", "H2"
    if (selection && selection.rangeCount > 0) {
      const parentEl = selection.anchorNode?.parentElement;
      if (parentEl?.tagName === tag) {
        document.execCommand("formatBlock", false, "p");
      } else {
        document.execCommand("formatBlock", false, level);
      }
    }
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      lastExternalValue.current = html;
      onChange(html);
    }
  }, [onChange]);

  /**
   * On every keystroke/input inside the contentEditable div,
   * push the raw HTML up to the parent component via onChange.
   * We also update lastExternalValue so the useEffect doesn't
   * accidentally overwrite what the user just typed.
   */
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      lastExternalValue.current = html;
      onChange(html);
    }
  }, [onChange]);

  /**
   * On paste, strip all HTML formatting and paste as plain text.
   * This prevents pasting from Word/web bringing in messy HTML.
   */
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  return (
    <div className="rte-container">
      {/* ── Toolbar ── */}
      <div className="rte-toolbar">
        {toolbarButtons.map((btn) => (
          <motion.button
            key={btn.command}
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent focus loss from editor
              execCommand(btn.command);
            }}
            className="rte-btn"
            title={btn.title}
          >
            <span style={btn.style}>{btn.icon}</span>
          </motion.button>
        ))}

        {/* Divider */}
        <div className="rte-divider" />

        {/* Heading buttons h1–h5 */}
        {["h1", "h2", "h3", "h4", "h5"].map((level) => (
          <motion.button
            key={level}
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onMouseDown={(e) => {
              e.preventDefault();
              toggleHeading(level);
            }}
            className="rte-btn"
            title={level.toUpperCase()}
          >
            <span style={{ fontWeight: 700, fontSize: 10, letterSpacing: '0.02em' }}>
              {level.toUpperCase()}
            </span>
          </motion.button>
        ))}
      </div>

      {/* ── Editor Area ── 
        NO dangerouslySetInnerHTML here. Content is set via the useEffect ref.
        This prevents React from re-rendering and resetting cursor position.
      */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="rte-editor"
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;
