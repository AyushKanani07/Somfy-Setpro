import { Info } from "lucide-react";
import { cn } from "~/lib/utils";

function ErrorMessage({
  errorMessage,
  className,
}: {
  errorMessage?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex justify-start items-center", className)}>
      <Info className="mr-1 h-3 w-3 text-destructive" />
      <p className={cn("text-sm text-destructive")}>{errorMessage}</p>
    </div>
  );
}

export default ErrorMessage;
