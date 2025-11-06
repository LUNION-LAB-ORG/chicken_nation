import { heroui } from "@heroui/react";
export default heroui({
    themes: {
        light: {
            colors: {
                primary: {
                    100: "#FEEFD3",
                    200: "#FEDBA8",
                    300: "#FEC27D",
                    400: "#FDA95C",
                    500: "#FD8127",
                    600: "#D9611C",
                    700: "#B64513",
                    800: "#922D0C",
                    900: "#791D07",
                    foreground: "#fff",
                    DEFAULT: "#fd8127",
                },
                secondary: {
                   100: "#FFFDF2",
                    200: "#FFF7CC",
                    300: "#FFF4BF",
                    400: "#FFE366",
                    500: "#ffcc00",
                    600: "#7B6000",
                    700: "#624A00",
                    800: "#4C3800",
                    900: "#412E00",
                    foreground: "#000",
                    DEFAULT: "#ffcc00",
                },
            }
        },
        dark: {
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
        }
    },
    addCommonColors: true,
    defaultTheme: "light",
});