import { useState, useCallback, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * TECH STACK INPUT (src/components/ui/TechStackInput.tsx)
 *
 * Comma-separated input that auto-generates circular tablet pills.
 * Type "React, Node.js, Express" and all 3 pills appear instantly.
 * Also supports Enter to add, Backspace to remove last, and a + button.
 *
 * PROPS:
 * - value: string[] — current list of tech stack items.
 * - onChange: (tags: string[]) => void — fires when tags are added/removed.
 * - placeholder: optional placeholder for the input field.
 */

interface TechStackInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const TechStackInput = ({
  value,
  onChange,
  placeholder = "Type techs separated by commas...",
}: TechStackInputProps) => {
  const [inputValue, setInputValue] = useState("");

  /**
   * Parse the input string, split by commas, trim each,
   * filter out empties and duplicates, then merge with existing tags.
   */
  const addTags = useCallback(() => {
    const raw = inputValue;
    if (!raw.trim()) return;

    // Split by comma, trim each piece, filter empty strings
    const newTags = raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Filter out duplicates (case-insensitive) against existing tags
    const unique = newTags.filter(
      (tag) => !value.some((existing) => existing.toLowerCase() === tag.toLowerCase())
    );

    if (unique.length > 0) {
      onChange([...value, ...unique]);
    }
    setInputValue("");
  }, [inputValue, value, onChange]);

  /**
   * Remove a tag by its index.
   */
  const removeTag = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange]
  );

  /**
   * Handle keyboard events:
   * - Enter: add all comma-separated tags from input.
   * - Backspace on empty input: remove the last tag.
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addTags();
      } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
        removeTag(value.length - 1);
      }
    },
    [addTags, inputValue, value, removeTag]
  );

  /**
   * Auto-detect comma during typing:
   * If the user types a comma at the end, immediately parse and create pills.
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;

      // If the value ends with a comma AND has content before it, auto-add
      if (val.endsWith(",") && val.slice(0, -1).trim()) {
        const raw = val.slice(0, -1); // Remove trailing comma
        const newTags = raw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

        const unique = newTags.filter(
          (tag) => !value.some((existing) => existing.toLowerCase() === tag.toLowerCase())
        );

        if (unique.length > 0) {
          onChange([...value, ...unique]);
        }
        setInputValue("");
      } else {
        setInputValue(val);
      }
    },
    [value, onChange]
  );

  return (
    <div>
      {/* ── Pills Display ── */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          <AnimatePresence>
            {value.map((tag, index) => (
              <motion.div
                key={`${tag}-${index}`}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="tech-pill-tablet"
              >
                <span className="font-grotesk text-xs font-medium">{tag}</span>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.3, rotate: 90 }}
                  whileTap={{ scale: 0.7 }}
                  onClick={() => removeTag(index)}
                  className="tech-pill-close"
                  title={`Remove ${tag}`}
                >
                  ×
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Input Row ── */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="clay-input flex-1"
          placeholder={placeholder}
        />
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={addTags}
          className="tech-add-btn"
          title="Add tech"
        >
          <span className="font-orbitron text-sm">+</span>
        </motion.button>
      </div>

      {/* ── Hint ── */}
      <p
        className="mt-1.5 font-grotesk text-xs"
        style={{ color: "rgba(240,227,164,0.3)" }}
      >
        Separate with commas — auto-creates pills • Backspace to remove last
      </p>
    </div>
  );
};

export default TechStackInput;
