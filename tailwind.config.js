/** @type {import('tailwindcss').Config} */
import { addIconSelectors } from "@iconify/tailwind";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        // 斷點
        screens: {
            sm: "450px", // 手機
            md: "800px", // 平板
            lg: "1200px", // 電腦
            // xl: "1440px", // 大螢幕電腦
        },
        // 標準字
        fontFamily: {
            // 使用範例一：class="font-lexend font-normal"
            // 使用範例二：class="font-lexend font-semibold"
            // 新增regular
            lexend: ["Lexend", "sans-serif"],
        },
        // 品牌色
        colors: {
            // 使用範例：class="text-brandRed-light"
            brandRed: {
                light: "#FCEBEC",
                lightHover: "#FAE1E3",
                lightActive: "#E7838D",
                normal: "#DC3545",
                normalHover: "#C6303E",
                normalActive: "#B02A37",
                dark: "#A52834",
                darkHover: "#842029",
                darkActive: "#63181F",
                darker: "#4D1318",
            },
            brandGray: {
                lightLight: "#FBFBFB",
                light: "#F6F6F6",
                lightHover: "#E4E4E4",
                lightActive: "#C6C6C6",
                normalLight: "#A4A4A4",
                normal: "#484848",
                normalHover: "#414141",
                normalActive: "#3A3A3A",
                dark: "#363636",
                darkHover: "#2B2B2B",
                darkActive: "#202020",
                darker: "#191919",
            },
            brandBlue: {
                lightLight: "#E9EAEC",
                light: "#E6E6E9",
                lightHover: "#B6BCD3",
                normal: "#626981",
                normalDarker: "#252B42",
                normalHover: "#21273B",
                normalActive: "#1E2235",
                dark: "#1C2032",
                darkHover: "#161A28",
                darkActive: "#11131E",
                darker: "#0D0F17",
            },
        },
        keyframes: {
            marquee: {
              '0%': { transform: 'translateX(0)' },
              '100%': { transform: 'translateX(-50%)' }
            }
          },
          animation: {
            marquee: 'marquee 100s linear infinite' 
          }
    },
},

plugins: [addIconSelectors(["mdi-light", "vscode-icons"])],
};

