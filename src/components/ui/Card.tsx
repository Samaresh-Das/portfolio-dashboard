import { truncateDescription } from "@/functions/truncate";
import { Exp, Skills } from "../DragNdrop";
import { motion } from "framer-motion";

interface Project {
  title: string;
  description: string;
  image: string;
}

const DragIcon = () => (
  <div className="drag-handle shrink-0" title="Drag to reorder">
    <svg width="16" height="20" viewBox="0 0 16 20" fill="currentColor">
      <circle cx="5" cy="4" r="2" /><circle cx="11" cy="4" r="2" />
      <circle cx="5" cy="10" r="2" /><circle cx="11" cy="10" r="2" />
      <circle cx="5" cy="16" r="2" /><circle cx="11" cy="16" r="2" />
    </svg>
  </div>
);

const Card = ({ item, url }: { item: Project | Exp | Skills; url: string }) => {
  if (url === "/projects") {
    const { title, description, image } = item as Project;
    const desc = truncateDescription(description, 80);

    return (
      <motion.div
        layout
        className="drag-card flex items-center gap-4"
      >
        <DragIcon />
        {/* Thumbnail */}
        <div
          className="shrink-0 w-16 h-16 rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(251,86,7,0.2)" }}
        >
          <img
            className="w-full h-full object-cover"
            src={image}
            alt={title}
          />
        </div>
        {/* Text */}
        <div className="flex-1 min-w-0">
          <h5
            className="font-orbitron font-bold text-base mb-1 truncate"
            style={{ color: "#fb5607" }}
          >
            {title}
          </h5>
          <p className="font-grotesk text-xs leading-relaxed" style={{ color: "rgba(240,227,164,0.5)" }}>
            {desc}
          </p>
        </div>
        {/* Reorder badge */}
        <div
          className="shrink-0 font-orbitron text-[9px] tracking-widest px-2 py-1 rounded"
          style={{
            background: "rgba(251,86,7,0.08)",
            color: "rgba(251,86,7,0.4)",
            border: "1px solid rgba(251,86,7,0.12)",
          }}
        >
          DRAG
        </div>
      </motion.div>
    );
  }

  if (url === "/experience") {
    const { companyName, timeLine, jobTitle, responsibility } = item as Exp;

    return (
      <motion.div layout className="drag-card">
        <div className="flex items-start gap-3">
          <DragIcon />
          <div className="flex-1 min-w-0">
            {/* Company + timeline */}
            <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
              <h5
                className="font-orbitron font-bold text-base"
                style={{ color: "#fb5607" }}
              >
                {companyName}
              </h5>
              <span
                className="font-orbitron text-[9px] tracking-widest px-2 py-1 rounded shrink-0"
                style={{
                  background: "rgba(255,159,28,0.1)",
                  color: "rgba(255,159,28,0.8)",
                  border: "1px solid rgba(255,159,28,0.2)",
                }}
              >
                {timeLine}
              </span>
            </div>
            {/* Job title */}
            <p className="font-grotesk text-sm font-medium mb-2" style={{ color: "rgba(240,227,164,0.7)" }}>
              {jobTitle}
            </p>
            {/* Responsibilities */}
            <ul className="space-y-1">
              {responsibility.map((resp, i) => (
                <li key={i} className="font-grotesk text-xs flex items-start gap-2" style={{ color: "rgba(240,227,164,0.45)" }}>
                  <span style={{ color: "rgba(251,86,7,0.5)", marginTop: 2 }}>▸</span>
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    );
  }

  if (url === "/skills") {
    const { text, logo } = item as Skills;

    return (
      <motion.div layout className="drag-card flex items-center gap-4">
        <DragIcon />
        <div
          className="shrink-0 w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(251,86,7,0.15)",
          }}
        >
          <img className="w-9 h-9 object-contain" src={logo} alt={text} />
        </div>
        <h5
          className="font-orbitron font-bold text-sm flex-1"
          style={{ color: "#fb5607" }}
        >
          {text}
        </h5>
        <div
          className="shrink-0 font-orbitron text-[9px] tracking-widest px-2 py-1 rounded"
          style={{
            background: "rgba(251,86,7,0.08)",
            color: "rgba(251,86,7,0.4)",
            border: "1px solid rgba(251,86,7,0.12)",
          }}
        >
          DRAG
        </div>
      </motion.div>
    );
  }

  return null;
};

export default Card;
