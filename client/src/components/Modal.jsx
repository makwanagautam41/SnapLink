import ReactDOM from "react-dom";
import { Icon } from "../utils/icons";
import useThemeStyles from "../utils/themeStyles.js";

const Modal = ({ children, onClose }) => {
  const styles = useThemeStyles();
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-brightness-50"
        onClick={onClose}
      />
      <div
        className={`relative z-10 rounded-lg shadow-lg max-w-lg w-full space-y-4 text-center ${styles.bg}`}
      >
        <button
          onClick={onClose}
          className={`absolute top-2 right-3 text-3xl cursor-pointer ${styles.bg}`}
        >
          <Icon.Close />
        </button>
        {children}
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default Modal;
