import { heroui } from "@heroui/react";
export default heroui({
    themes: {
        light: {
            colors: {
                primary: {
                    100: "#FFEBCC",
                    200: "#FFD299",
                    300: "#FFB366",
                    400: "#FF943F",
                    500: "#FF6200",
                    600: "#DB4700",
                    700: "#B73000",
                    800: "#931E00",
                    900: "#7A1100",
                    foreground: "#FFFFFF",
                    DEFAULT: "#FF6200",
                },
                secondary: {
                    100: "#FFFDF2",
                    200: "#FFF7CC",
                    300: "#FFF3BF",
                    400: "#FFE066",
                    500: "#ffc600",
                    600: "#7B6000",
                    700: "#624A00",
                    800: "#4C3800",
                    900: "#412E00",
                    foreground: "#000000",
                    DEFAULT: "#ffc600",
                }
            }
        },
        dark: {
            colors: {
                primary: {
                    100: "#FFEBCC",
                    200: "#FFD299",
                    300: "#FFB366",
                    400: "#FF943F",
                    500: "#FF6200",
                    600: "#DB4700",
                    700: "#B73000",
                    800: "#931E00",
                    900: "#7A1100",
                    foreground: "#FFFFFF",
                    DEFAULT: "#FF6200",
                },
                secondary: {
                    100: "#FFFDF2",
                    200: "#FFF7CC",
                    300: "#FFF3BF",
                    400: "#FFE066",
                    500: "#ffc600",
                    600: "#7B6000",
                    700: "#624A00",
                    800: "#4C3800",
                    900: "#412E00",
                    foreground: "#000000",
                    DEFAULT: "#ffc600",
                }
            }
        }
    },
    addCommonColors: true,
    defaultTheme: "light",
});