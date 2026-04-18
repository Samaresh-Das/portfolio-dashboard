import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const NotAllowed = () => {
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (iconRef.current) {
      gsap.from(iconRef.current, {
        scale: 0.3,
        opacity: 0,
        rotation: -20,
        duration: 0.9,
        ease: "elastic.out(1, 0.5)",
        delay: 0.2,
      });
    }
  }, []);

  return (
    <div className="page-container flex items-center justify-center min-h-screen">
      <div className="text-center max-w-sm px-6">
        {/* Icon */}
        <div ref={iconRef} className="flex justify-center mb-8">
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(251,86,7,0.08))",
              border: "1px solid rgba(239,68,68,0.3)",
              boxShadow: "0 0 40px rgba(239,68,68,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="rgba(239,68,68,0.8)"
              className="w-12 h-12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
        </div>

        {/* Error code */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-3"
        >
          <span
            className="font-orbitron text-[10px] tracking-widest px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(239,68,68,0.1)",
              color: "rgba(239,68,68,0.7)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            ERROR 403 — FORBIDDEN
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="font-orbitron font-black text-3xl mb-4"
          style={{ color: "#ef4444" }}
        >
          ACCESS DENIED
        </motion.h1>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="font-grotesk text-sm leading-relaxed mb-8"
          style={{ color: "rgba(240,227,164,0.5)" }}
        >
          You don't have administrator privileges to access this command center. Only the registered owner can enter.
        </motion.p>

        {/* Separator */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-px" style={{ background: "rgba(239,68,68,0.15)" }} />
          <span className="font-orbitron text-[9px] tracking-widest" style={{ color: "rgba(239,68,68,0.3)" }}>
            RESTRICTED ZONE
          </span>
          <div className="flex-1 h-px" style={{ background: "rgba(239,68,68,0.15)" }} />
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-3 rounded-xl font-orbitron font-semibold text-xs tracking-wider transition-all"
              style={{
                background: "linear-gradient(135deg, rgba(251,86,7,0.15), rgba(255,159,28,0.08))",
                border: "1px solid rgba(251,86,7,0.3)",
                color: "#fb5607",
                boxShadow: "0 4px 20px rgba(251,86,7,0.1)",
                textDecoration: "none",
              }}
            >
              ← RETURN TO ENTRY
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotAllowed;
