import { removeToast, selectToasts } from "../../features/ui/uiSlice";
import { Toast } from "../ui/Toast";
import { useDispatch , useSelector } from "react-redux";

const ToastContainer = () => {
  const toasts = useSelector(selectToasts);
  const dispatch = useDispatch() 

  return (
    <div className="fixed bottom-7 right-7 z-9999 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={(id) => dispatch(removeToast(id))}
        />
      ))}
    </div>
  );
};

export default ToastContainer;