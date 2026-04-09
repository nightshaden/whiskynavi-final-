import { cn } from "@/lib/utils";

interface FormMessageProps {
  message?: string | null;
  variant?: "error" | "success" | "info";
  className?: string;
}

export function FormMessage({
  message,
  variant = "error",
  className,
}: FormMessageProps) {
  if (!message) return null;

  return (
    <p
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "text-sm",
        variant === "error" && "text-red-500",
        variant === "success" && "text-green-600",
        variant === "info" && "text-blue-600",
        className,
      )}
    >
      {message}
    </p>
  );
}
