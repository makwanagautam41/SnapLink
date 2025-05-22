import { useTheme } from "../context/ThemeContext";

const getThemeStyle = (theme) => ({
  text: theme === "dark" ? "text-[#FAFAFA]" : "text-[#262626]",

  bg: theme === "dark" ? "bg-[#0A0A0A]" : "bg-[#FFFFFF]",
  bg2: theme === "dark" ? "bg-[#171717]" : "bg-[#D4D4D4]",
  bg3: theme === "dark" ? "bg-[#262626]" : "bg-[#F5F5F5]",

  input:
    theme === "light"
      ? "hover:bg-[#E5E5E5] bg-[#E5E5E5] hover:text-[#0A0A0A]"
      : "bg-[#171717] hover:text-[#FAFAFA] text-[#FAFAFA]",
  input2:
    theme === "light"
      ? "hover:bg-[#E5E5E5] bg-[#E5E5E5] hover:text-[#0A0A0A] border-gray-300 placeholder-gray-500"
      : "bg-[#171717] hover:text-[#FAFAFA] text-[#FAFAFA] border-gray-600 placeholder-gray-300",

  hover: theme === "light" ? "hover:bg-[#E5E5E5]" : "hover:bg-[#171717]",

  active: theme === "light" ? "bg-[#E5E5E5]" : "bg-[#404040]",

  messageBubble: (isSender) =>
    isSender
      ? "bg-[#000000] text-[#FAFAFA] rounded-2xl rounded-br-sm border border-[#ffffff]"
      : theme === "dark"
      ? "bg-[#171717] text-[#FAFAFA] border border-[#404040] rounded-2xl rounded-bl-sm"
      : "bg-[#FFFFFF] text-[#0A0A0A] border border-[#E5E5E5] rounded-2xl rounded-bl-sm",
});

export default function useThemeStyles() {
  const { theme } = useTheme();
  return getThemeStyle(theme);
}
