import { ReactNode } from "react";

interface Props {
  className?: string;
  children: ReactNode;
  type?: "button" | "submit" | "reset"; // Restricting the type to valid HTML button types
  onClick?: () => void;
}

const Button = ({ className, children, type, onClick }: Props) => {
  return (
    <button
      className={`${className} text-[#f0e3a4] w-full  bg-[#fb5607] hover:bg-[#f0e3a4] hover:text-[#fb5607] focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-between  mr-2 mb-2`}
      type={type}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
