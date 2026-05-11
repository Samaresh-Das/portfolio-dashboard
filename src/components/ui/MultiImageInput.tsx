import { motion } from "framer-motion";

/**
 * MULTI IMAGE INPUT (src/components/ui/MultiImageInput.tsx)
 *
 * Supports up to 4 image URL fields for project screenshots/galleries.
 * The first image is always required (primary thumbnail).
 * Images 2–4 are optional and only shown when user clicks the "+" button.
 *
 * PROPS:
 * - images: string[] — current array of image URLs (length 1–4).
 * - onChange: (images: string[]) => void — fires when any URL changes or slot is added/removed.
 */

interface MultiImageInputProps {
  images: string[];
  onChange: (images: string[]) => void;
}

const MAX_IMAGES = 4;

const MultiImageInput = ({ images, onChange }: MultiImageInputProps) => {
  /**
   * Update a specific image URL by index.
   * Creates a new array copy and replaces the value at the target index.
   */
  const updateImage = (index: number, value: string) => {
    const updated = [...images];
    updated[index] = value;
    onChange(updated);
  };

  /**
   * Add a new empty image slot (up to MAX_IMAGES).
   */
  const addSlot = () => {
    if (images.length < MAX_IMAGES) {
      onChange([...images, ""]);
    }
  };

  /**
   * Remove an image slot by index (minimum 1 must remain).
   */
  const removeSlot = (index: number) => {
    if (images.length <= 1) return;
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {images.map((url, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-2"
        >
          {/* Image index badge */}
          <div
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: index === 0
                ? "linear-gradient(135deg, rgba(251,86,7,0.2), rgba(255,159,28,0.1))"
                : "rgba(255,255,255,0.04)",
              border: `1px solid ${index === 0 ? "rgba(251,86,7,0.3)" : "rgba(251,86,7,0.12)"}`,
            }}
          >
            <span
              className="font-orbitron text-[9px]"
              style={{ color: index === 0 ? "#fb5607" : "rgba(240,227,164,0.4)" }}
            >
              {index + 1}
            </span>
          </div>

          {/* URL input */}
          <input
            type="text"
            value={url}
            onChange={(e) => updateImage(index, e.target.value)}
            className="clay-input flex-1"
            placeholder={index === 0 ? "Primary image URL (required)" : `Image ${index + 1} URL (optional)`}
          />

          {/* Remove button (only if more than 1 slot) */}
          {images.length > 1 && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => removeSlot(index)}
              className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#ef4444",
                cursor: "pointer",
                fontSize: 14,
              }}
              title="Remove image"
            >
              ×
            </motion.button>
          )}
        </motion.div>
      ))}

      {/* Add more images button */}
      {images.length < MAX_IMAGES && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={addSlot}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-200"
          style={{
            background: "rgba(251,86,7,0.06)",
            border: "1px dashed rgba(251,86,7,0.25)",
            cursor: "pointer",
          }}
        >
          <span
            className="w-5 h-5 rounded-md flex items-center justify-center text-xs"
            style={{
              background: "rgba(251,86,7,0.15)",
              color: "#fb5607",
            }}
          >
            +
          </span>
          <span
            className="font-orbitron text-[9px] tracking-widest"
            style={{ color: "rgba(251,86,7,0.6)" }}
          >
            ADD IMAGE ({images.length}/{MAX_IMAGES})
          </span>
        </motion.button>
      )}
    </div>
  );
};

export default MultiImageInput;
