import type { LucideIcon } from "lucide-react";

export const Icon = ({
  icon: LucideIcon,
  color,
  size,
  className,
}: {
  icon: LucideIcon;
  color?: string;
  size?: number;
  className?: string;
}) => {
  return <LucideIcon color={color} size={size} className={className} />;
};
