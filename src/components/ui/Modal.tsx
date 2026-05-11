import { ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * MODAL COMPONENT (src/components/ui/Modal.tsx)
 * 
 * PROPS:
 * - isOpen: Boolean controlling visibility (state usually managed in parent).
 * - onClose: Function to trigger when backdrop or close button is clicked.
 * - title: Heading displayed at the top of the modal.
 * - children: Content (JSX) to be rendered inside the modal body.
 * 
 * WHY USE THIS?
 * Provides a consistent, themed (glassmorphism) overlay for updating portfolio data.
 */
const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  /**
   * HOOK: BODY SCROLL LOCK
   * When a modal is open, we disable scroll on the 'body' tag to prevent 
   * the user from accidentally scrolling the background page.
   * Cleanup function ensures scroll is restored when component unmounts.
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(13,12,10,0.75)" }}
            onClick={onClose}
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(251,86,7,0.1) 0%, rgba(255,159,28,0.05) 50%, rgba(240,227,164,0.07) 100%)",
              border: "1px solid rgba(251,86,7,0.3)",
              boxShadow: "0 24px 80px rgba(251,86,7,0.25), 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            {/* Top glow line */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(251,86,7,0.6), rgba(255,159,28,0.6), transparent)" }}
            />

            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                  style={{
                    background: "linear-gradient(135deg, rgba(251,86,7,0.25), rgba(255,159,28,0.15))",
                    border: "1px solid rgba(251,86,7,0.4)",
                  }}
                >
                  ✎
                </div>
                <h2 className="font-orbitron font-bold text-sm text-gradient">{title}</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(240,227,164,0.6)",
                  cursor: "pointer",
                }}
              >
                ✕
              </motion.button>
            </div>

            {/* Separator */}
            <div className="mx-6 h-px" style={{ background: "linear-gradient(90deg, rgba(251,86,7,0.3), transparent)" }} />

            {/* Body */}
            <div className="p-6 pt-4">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
