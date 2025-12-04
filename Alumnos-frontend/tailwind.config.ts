// /** @type {import('tailwindcss').Config} */
// module.exports = {
//     content: [
//         "./app/*.{js,ts,jsx,tsx}",
//         "./app/**/*.{js,ts,jsx,tsx}",
//         "./src/**/*.{js.,ts,jsx,tsx}"
//     ],
//     theme: {
//         extend: {
//             fontFamily: {
//                 bentham: ["var(--font-bentham)", "serif"],
//                 anek: ["var(--font-anek)", "sans-serif"],
//             },
//         },
//     },
//     plugins: [],
// }
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}"
    ],
    theme: {
        extend: {
            fontFamily: {
                bentham: ["var(--font-bentham)", "serif"],
                anek: ["var(--font-anek)", "sans-serif"],
            },
        },
    },
    plugins: [],
};

export default config;
