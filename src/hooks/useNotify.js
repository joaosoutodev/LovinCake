import { useToast } from "../context/ToastContext";

export default function useNotify() {
  const toast = useToast();
  return {
    success: (msg) => toast?.success?.(msg) || alert(msg),
    error: (msg) => toast?.error?.(msg) || alert(msg),
    info: (msg) => toast?.info?.(msg) || alert(msg),
  };
}
