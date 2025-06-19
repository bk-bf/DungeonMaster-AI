/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    darkMode: 'class', // Enable class-based dark mode
    theme: {
        extend: {
            // Add custom dark mode colors if needed
            colors: {
                'dark-bg': '#1a1a1a',
                'dark-surface': '#2d2d2d',
                'dark-border': '#404040',
            }
        },
    },
    plugins: [],
}
