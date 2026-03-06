import { Loader } from "lucide-react";

function LoaderComponent({
  className,
  size,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Loader
      size={size || 18}
      className={`animate-spin text-white ${className}`}
    />
  );
}

export default LoaderComponent;
