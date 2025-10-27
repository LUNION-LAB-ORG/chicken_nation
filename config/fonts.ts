import { Poppins} from "next/font/google";
import localFont from "next/font/local";

export const fontSans = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["500"],
});

export const fontTitle = localFont({
  src: "../public/assets/fonts/balbeer/Balbeer-Rustic.ttf",
  variable: "--font-title",
});