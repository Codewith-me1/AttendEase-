// components/ui/divider.tsx
import React from "react";

interface DividerProps {
  children?: React.ReactNode;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`flex items-center w-full ${className}`}>
      <hr className="flex-grow border-t border-muted-foreground" />
      {children && (
        <span className="px-2 text-xs text-muted-foreground">{children}</span>
      )}
      <hr className="flex-grow border-t border-muted-foreground" />
    </div>
  );
};

export default Divider;
