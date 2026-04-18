import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const modules = [
  {
    path: "/dashboard/projects",
    label: "Projects",
    icon: "◈",
    description: "Manage & reorder portfolio projects",
    tag: "CONTENT",
    color: "#fb5607",
    glow: "rgba(251,86,7,0.3)",
  },
  {
    path: "/dashboard/experience",
    label: "Experience",
    icon: "◉",
    description: "Work history, roles & responsibilities",
    tag: "CAREER",
    color: "#ff9f1c",
    glow: "rgba(255,159,28,0.3)",
  },
  {
    path: "/dashboard/skills",
    label: "Skills",
    icon: "◎",
    description: "Technical skills & proficiency levels",
    tag: "EXPERTISE",
    color: "#f0e3a4",
    glow: "rgba(240,227,164,0.3)",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

const Dashboard = () => {
  const email = useSelector((state: RootState) => state.auth.email);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ringsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    if (ringsRef.current) {
      const rings = ringsRef.current.querySelectorAll(".hero-ring");
      tl.from(rings, {
        scale: 0.5,
        opacity: 0,
        stagger: 0.2,
        duration: 1.2,
        ease: "power3.out",
      });
    }

    if (titleRef.current) {
      tl.from(
        titleRef.current,
        { opacity: 0, y: -30, duration: 0.8, ease: "power3.out" },
        "-=0.8"
      );
    }

    if (subtitleRef.current) {
      tl.from(
        subtitleRef.current,
        { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" },
        "-=0.4"
      );
    }
  }, []);

  return (
    <div className="page-container">
      <div className="content-wrapper py-8">
        {/* Hero Section */}
        <div className="relative flex flex-col items-center text-center mb-16 pt-8">
          {/* Decorative rings */}
          <div ref={ringsRef} className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="hero-ring"
              style={{ width: 300, height: 300, animationDelay: "0s" }}
            />
            <div
              className="hero-ring absolute"
              style={{ width: 450, height: 450, animationDelay: "0.5s" }}
            />
            <div
              className="hero-ring absolute"
              style={{ width: 600, height: 600, animationDelay: "1s" }}
            />
          </div>

          {/* Status chip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="mb-6 relative z-10"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
              style={{
                background: "rgba(251,86,7,0.1)",
                borderColor: "rgba(251,86,7,0.3)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div className="status-dot" style={{ background: "#22c55e" }} />
              <span className="font-orbitron text-[10px] tracking-widest" style={{ color: "rgba(240,227,164,0.8)" }}>
                SYSTEM ONLINE — AUTHORIZED ACCESS
              </span>
            </div>
          </motion.div>

          {/* Main title */}
          <h1
            ref={titleRef}
            className="font-orbitron font-black text-5xl md:text-7xl mb-4 relative z-10"
            style={{ lineHeight: 1.1 }}
          >
            <span className="text-gradient">PORTFOLIO</span>
            <br />
            <span
              className="font-orbitron font-light text-3xl md:text-4xl tracking-widest"
              style={{ color: "rgba(240,227,164,0.5)" }}
            >
              COMMAND CENTER
            </span>
          </h1>

          <p
            ref={subtitleRef}
            className="font-grotesk text-base max-w-md relative z-10"
            style={{ color: "rgba(240,227,164,0.5)" }}
          >
            Mission control for your digital portfolio. Manage, reorder, and update all data in real-time.
          </p>

          {/* Owner tag */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 relative z-10"
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span className="font-orbitron text-[9px] tracking-wider" style={{ color: "rgba(251,86,7,0.6)" }}>
                OPERATOR
              </span>
              <span className="font-grotesk text-xs" style={{ color: "rgba(240,227,164,0.6)" }}>
                {email}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto"
        >
          {[
            { label: "MODULES", value: "03", sub: "Active" },
            { label: "FIREBASE", value: "LIVE", sub: "Connected" },
            { label: "STATUS", value: "OK", sub: "All Systems" },
          ].map((stat) => (
            <div key={stat.label} className="stat-card text-center">
              <div
                className="font-orbitron font-black text-2xl mb-1 text-gradient"
              >
                {stat.value}
              </div>
              <div className="font-orbitron text-[9px] tracking-widest mb-0.5" style={{ color: "rgba(251,86,7,0.7)" }}>
                {stat.label}
              </div>
              <div className="font-grotesk text-xs" style={{ color: "rgba(240,227,164,0.4)" }}>
                {stat.sub}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Module cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {modules.map((mod) => (
            <motion.div key={mod.path} variants={itemVariants}>
              <Link to={mod.path} style={{ textDecoration: "none" }}>
                <div
                  className="clay-card group p-6 h-full cursor-pointer"
                  style={{ minHeight: 220 }}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{
                        background: `linear-gradient(135deg, ${mod.color}22, ${mod.color}11)`,
                        border: `1px solid ${mod.color}33`,
                        boxShadow: `0 4px 16px ${mod.glow}`,
                      }}
                    >
                      {mod.icon}
                    </div>
                    <span
                      className="font-orbitron text-[9px] tracking-widest px-2 py-1 rounded"
                      style={{
                        background: `${mod.color}15`,
                        color: mod.color,
                        border: `1px solid ${mod.color}25`,
                      }}
                    >
                      {mod.tag}
                    </span>
                  </div>

                  {/* Content */}
                  <h3
                    className="font-orbitron font-bold text-xl mb-2 transition-all duration-300"
                    style={{ color: mod.color }}
                  >
                    {mod.label.toUpperCase()}
                  </h3>
                  <p className="font-grotesk text-sm" style={{ color: "rgba(240,227,164,0.5)" }}>
                    {mod.description}
                  </p>

                  {/* Bottom arrow */}
                  <div className="mt-6 flex items-center gap-2">
                    <span className="font-orbitron text-[10px] tracking-widest" style={{ color: `${mod.color}70` }}>
                      OPEN MODULE
                    </span>
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      style={{ color: mod.color }}
                    >
                      →
                    </motion.span>
                  </div>

                  {/* Hover glow sweep */}
                  <div
                    className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${mod.glow} 0%, transparent 60%)`,
                    }}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-16"
        >
          <p className="font-orbitron text-[10px] tracking-widest" style={{ color: "rgba(251,86,7,0.3)" }}>
            ◈ ALL CHANGES SYNC TO FIREBASE IN REAL-TIME ◈
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
