import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  darkMode: ["class"],
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        secondaryBackground: "#f9fafb ",
        themeBlueColor: "#3176B1",
        themeLightRedColor: "#FFE6E6",
        hoverGrayColor: "#f3f4f6",
        lightGrayColor: "#F6F5F5",
        themeRedColor: "#E04727",
        buttonColor: "#F59E0B",
        buttonGrayColor: "#E9E9E9",
        buttonDarkGrayColor: "#BBB",
        primaryColor: "#F59E0B",
        inputFocusColor: "#FAB800",
        textDarkColor: "#363636",
        textLightColor: "#AAAAAA",
        borderColor: "#94A3B8",
        borderLightColor: "#0000001A",
        iconColor: "#808080",
        fieldBorderColor: "#36363633",
        deleteButtonColor: "#dc2626",
        iconPanelColor: "#1f2937",
        toolTipColor: "#1f2937",
        motorInputBgColor: "#6894D3",
        chipColor: "#F4F4F4",
        accordionColor: "#E3E3E3",
        // Blue color variants for consistent usage
        blueLight: "#eff6ff", // blue-50
        blueLighter: "#dbeafe", // blue-100
        blueBorder: "#bfdbfe", // blue-200
        blueAccent: "#3b82f6", // blue-500
        bluePrimary: "#2563eb", // blue-600
        blueDark: "#1d4ed8", // blue-700
        blueText: "#2563eb", // blue-600 for text
        blueBackground: "#dbeafe", // blue-100 for backgrounds
        blueHover: "#3b82f6", // blue-500 for hover states
        blueFocus: "#3b82f6", // blue-500 for focus states
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar")],
} satisfies Config;
