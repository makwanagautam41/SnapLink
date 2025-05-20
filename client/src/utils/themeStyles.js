import { useTheme } from "../context/ThemeContext";

const getThemeStyle = (theme) => ({
  text: theme === "dark" ? "text-white" : "text-gray-800",
  bg: theme === "dark" ? "bg-[#131c2f]" : "bg-white",
  bg2: theme === "dark" ? "bg-[#131c2f]" : "bg-gray-200",
  bg3: theme === "dark" ? "bg-[#131c2f]" : "bg-gray-100",
  input:
    theme === "light"
      ? "hover:bg-gray-200 bg-gray-200 hover:text-gray-900"
      : "bg-gray-900 hover:text-white text-white",
  hover:
    theme === "light"
      ? "hover:bg-gray-200 hover:text-gray-900"
      : "hover:bg-gray-900 hover:text-white",
  active: theme === "light" ? "bg-gray-200" : "bg-gray-900",

  messageBubble: (isSender) =>
    isSender
      ? "bg-black text-white rounded-2xl rounded-br-sm"
      : theme === "dark"
      ? "bg-[#1e2a3a] text-white border border-gray-700 rounded-2xl rounded-bl-sm"
      : "bg-white text-black border border-gray-200 rounded-2xl rounded-bl-sm",
});

export default function useThemeStyles() {
  const { theme } = useTheme();
  return getThemeStyle(theme);
}
