interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

export default function LoadingSpinner({
  size = "md",
  message = "Loading...",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center space-y-4">
        <div
          className={`${sizeClasses[size]} border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto`}
        ></div>
        {message && <p className="text-gray-600 font-medium">{message}</p>}
      </div>
    </div>
  );
}
