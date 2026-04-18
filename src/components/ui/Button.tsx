import { ReactNode } from "react";
import { motion } from "framer-motion";

interface Props {
  className?: string;
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

const Button = ({ className, children, type, onClick }: Props) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.97 }}
      className={`${className} btn-clay btn-primary flex items-center justify-center gap-2`}
      type={type}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
};

export default Button;
