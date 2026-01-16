import { useTheme } from "@/providers/theme-provider";

export function useColorScheme() {
  const { theme } = useTheme();
  return theme;
}
