import { toast } from "react-toastify";

const baseOptions = {
    position: "top-right",
    autoClose: 2600,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
};

export const notify = {
    success: (message) => toast.success(message, baseOptions),
    error: (message) => toast.error(message, baseOptions),
    warning: (message) => toast.warning(message, baseOptions),
    info: (message) => toast.info(message, baseOptions),
};
