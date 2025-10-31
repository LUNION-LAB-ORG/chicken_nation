import { heroui } from "@heroui/react";
export default heroui({
    themes: {
        light: {
            colors: {
                primary: {
                    200: "#f57e30",
                    500: "#fd8127",
                    600: "#ff6000",
                    foreground: "#fff",
                    DEFAULT: "#fd8127",
                },
                secondary: {
                    200: "#ffcc00",
                    500: "#ffcc00",
                    600: "#fdbf17",
                    foreground: "#000",
                    DEFAULT: "#ffcc00",
                },
            }
        },
        dark: {
            colors: {
                background: "#0C0C0C",
                primary: {
                    200: "#f57e30",
                    600: "#ff6000",
                    500: "#fd8127",
                    foreground: "#fff",
                    DEFAULT: "#fd8127",
                },
                secondary: {
                    200: "#ffcc00",
                    500: "#ffcc00",
                    600: "#fdbf17",
                    foreground: "#000",
                    DEFAULT: "#ffcc00",
                }
            }
        }
    },
    addCommonColors: true,
    defaultTheme: "light",
});