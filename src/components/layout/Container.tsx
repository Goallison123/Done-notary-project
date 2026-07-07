import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({
  children,
  className = "",
}: ContainerProps) {
  return (
    <div
  className={`
    w-full
    max-w-7xl
    mx-auto
    px-8
    lg:px-12
    ${className}
  `}
>
      {children}
    </div>
  );
}