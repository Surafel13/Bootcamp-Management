import { useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X} from "lucide-react";

interface ToastProps {
  id: number;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: (id: number) => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: "bg-green-100 text-green-600",
  error: "bg-red-100 text-red-600",
  warning: "bg-yellow-100 text-yellow-600",
  info: "bg-blue-100 text-blue-600",
};

export const Toast = ({
  id,
  message,
  type = "info",
  duration = 3000,
  onClose,
}: ToastProps) => {
  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div className="min-w-70 flex items-center gap-3 p-4 rounded-lg border shadow-lg bg-white dark:bg-bg-dark border-neutral-200 dark:border-neutral-700 animate-[slideIn_.3s_ease]">
      
      {/* Icon */}
      <div className={`w-8 h-8 flex items-center justify-center rounded-md ${styles[type]}`}>
        <Icon size={16} />
      </div>

      {/* Body */}
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white capitalize">
          {type}
        </h4>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {message}
        </p>
      </div>

      {/* Close */}
      <button
        onClick={() => onClose(id)}
        className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
      >
        <X size={16} />
      </button>
    </div>
  );
};