import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface PageLayoutProps {
  title: string;
  icon: string;
  tag: string;
  children: ReactNode;
}

const PageLayout = ({ title, icon, tag, children }: PageLayoutProps) => {
  return (
    <div className="page-container">
      <div className="content-wrapper py-8">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="mb-8"
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-4">
            <Link
              to="/dashboard"
              className="font-orbitron text-[10px] tracking-widest transition-colors duration-200"
              style={{ color: "rgba(251,86,7,0.5)" }}
            >
              COMMAND
            </Link>
            <span className="font-orbitron text-[10px]" style={{ color: "rgba(251,86,7,0.3)" }}>
              /
            </span>
            <span className="font-orbitron text-[10px] tracking-widest" style={{ color: "rgba(251,86,7,0.8)" }}>
              {title.toUpperCase()}
            </span>
          </div>

          {/* Title row */}
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(251,86,7,0.2), rgba(255,159,28,0.1))",
                border: "1px solid rgba(251,86,7,0.3)",
                boxShadow: "0 4px 20px rgba(251,86,7,0.2)",
              }}
            >
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-orbitron font-black text-3xl text-gradient">
                  {title.toUpperCase()}
                </h1>
                <span
                  className="font-orbitron text-[9px] tracking-widest px-2 py-1 rounded"
                  style={{
                    background: "rgba(251,86,7,0.1)",
                    color: "rgba(251,86,7,0.7)",
                    border: "1px solid rgba(251,86,7,0.2)",
                  }}
                >
                  {tag}
                </span>
              </div>
              <p className="font-grotesk text-sm mt-1" style={{ color: "rgba(240,227,164,0.4)" }}>
                Changes sync to Firebase in real-time
              </p>
            </div>
          </div>

          {/* Separator line */}
          <div className="mt-6 h-px" style={{ background: "linear-gradient(90deg, rgba(251,86,7,0.4), rgba(251,86,7,0.1), transparent)" }} />
        </motion.div>

        {/* Page content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default PageLayout;
