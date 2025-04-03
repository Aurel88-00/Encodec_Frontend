import { useContext } from "react"
import { ToastContext } from "../../Context/ToastContext"

export const useToast = () => {
    if(!ToastContext){
        throw new Error("ToastContext is not defined")
    }

    return useContext(ToastContext);
}