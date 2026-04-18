import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const GradientBackground = () => {
  const blob1 = useRef<HTMLDivElement>(null);
  const blob2 = useRef<HTMLDivElement>(null);
  const blob3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate blobs with GSAP for silky smooth movement
    if (blob1.current) {
      gsap.to(blob1.current, {
        x: 80,
        y: -50,
        duration: 9,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    }
    if (blob2.current) {
      gsap.to(blob2.current, {
        x: -60,
        y: 40,
        duration: 7,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 2,
      });
    }
    if (blob3.current) {
      gsap.to(blob3.current, {
        x: 40,
        y: 60,
        duration: 11,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 4,
      });
    }
  }, []);

  return (
    <>
      {/* Grid overlay */}
      <div className="grid-overlay" />

      {/* Scanline effect */}
      <div className="scanline" />

      {/* Gradient blobs */}
      <div className="blob-container">
        <div ref={blob1} className="blob blob-1" />
        <div ref={blob2} className="blob blob-2" />
        <div ref={blob3} className="blob blob-3" />
        <div className="blob blob-4" style={{ animation: "blobFloat 13s ease-in-out infinite reverse" }} />
      </div>
    </>
  );
};

export default GradientBackground;
