import React from "react";
import Link from "next/link";

export interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  text?: string;
  href?: string;
  variant?: "primary" | "light";
  className?: string;
}

export function PrimaryButton({
  children,
  text = "Let's go!",
  href,
  variant = "primary",
  className = "",
  ...props
}: PrimaryButtonProps) {
  const isLight = variant === "light";

  const content = (
    <>
      <span
        className={`flex-1 px-4 text-center font-semibold text-sm tracking-wide ${
          isLight ? "text-black" : "text-white"
        }`}
      >
        {children || text}
      </span>
      <span
        className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border-[2.5px] transition-transform duration-300 ${
          isLight
            ? "border-white bg-[#ff4b2f]"
            : "border-[#ff4b2f] bg-white"
        }`}
      >
        <svg
          width={14}
          height={17}
          viewBox="0 0 16 19"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        >
          <circle cx="1.61321" cy="1.61321" r="1.5" fill={isLight ? "white" : "#ff4b2f"} />
          <circle cx="5.73583" cy="1.61321" r="1.5" fill={isLight ? "white" : "#ff4b2f"} />
          <circle cx="5.73583" cy="5.5566" r="1.5" fill={isLight ? "white" : "#ff4b2f"} />
          <circle cx="9.85851" cy="5.5566" r="1.5" fill={isLight ? "white" : "#ff4b2f"} />
          <circle cx="9.85851" cy="9.5" r="1.5" fill={isLight ? "white" : "#ff4b2f"} />
          <circle cx="13.9811" cy="9.5" r="1.5" fill={isLight ? "white" : "#ff4b2f"} />
          <circle cx="5.73583" cy="13.4434" r="1.5" fill={isLight ? "white" : "#ff4b2f"} />
          <circle cx="9.85851" cy="13.4434" r="1.5" fill={isLight ? "white" : "#ff4b2f"} />
          <circle cx="1.61321" cy="17.3868" r="1.5" fill={isLight ? "white" : "#ff4b2f"} />
          <circle cx="5.73583" cy="17.3868" r="1.5" fill={isLight ? "white" : "#ff4b2f"} />
        </svg>
      </span>
    </>
  );

  const baseClasses = `group inline-flex h-11 min-w-[150px] items-center justify-between rounded-full pl-3.5 pr-1 transition-all duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
    isLight
      ? "bg-white text-black shadow-md hover:bg-white/90 focus-visible:ring-black"
      : "bg-[#ff4b2f] text-white shadow-[0_6px_20px_rgba(255,75,47,0.22)] hover:bg-[#e63e24] focus-visible:ring-[#ff4b2f]"
  } ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button className={baseClasses} {...props}>
      {content}
    </button>
  );
}

export default PrimaryButton;
