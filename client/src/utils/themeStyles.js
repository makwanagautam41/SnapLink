import { useTheme } from "../context/ThemeContext";

const getThemeStyle = (theme) => ({
  text: theme === "dark" ? "text-white" : "text-gray-800",
  bg: theme === "dark" ? "bg-[#131c2f]" : "bg-white",
  bg2: theme === "dark" ? "bg-[#131c2f]" : "bg-gray-200",
  input:
    theme === "light"
      ? "hover:bg-gray-200 bg-gray-200 hover:text-gray-900"
      : "bg-gray-900 hover:text-white",
  hover:
    theme === "light"
      ? "hover:bg-gray-200 hover:text-gray-900"
      : "hover:bg-gray-900 hover:text-white",
  active: theme === "light" ? "bg-gray-200" : "bg-gray-900",
});

export default function useThemeStyles() {
  const { theme } = useTheme();
  return getThemeStyle(theme);
}
