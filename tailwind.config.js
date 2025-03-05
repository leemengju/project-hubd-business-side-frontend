/** @type {import('tailwindcss').Config} */
import { addIconSelectors } from "@iconify/tailwind";

export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		screens: {
  			sm: '450px',
  			md: '800px',
  			lg: '1200px'
  		},
  		fontFamily: {
  			lexend: [
  				'Lexend',
  				'sans-serif'
  			]
  		},
  		colors: {
  			brandRed: {
  				light: '#FCEBEC',
  				lightHover: '#FAE1E3',
  				lightActive: '#E7838D',
  				normal: '#DC3545',
  				normalHover: '#C6303E',
  				normalActive: '#B02A37',
  				dark: '#A52834',
  				darkHover: '#842029',
  				darkActive: '#63181F',
  				darker: '#4D1318'
  			},
  			brandGray: {
  				lightLight: '#FBFBFB',
  				light: '#F6F6F6',
  				lightHover: '#E4E4E4',
  				lightActive: '#C6C6C6',
  				normalLight: '#A4A4A4',
  				normal: '#484848',
  				normalHover: '#414141',
  				normalActive: '#3A3A3A',
  				dark: '#363636',
  				darkHover: '#2B2B2B',
  				darkActive: '#202020',
  				darker: '#191919'
  			},
  			brandBlue: {
  				lightLight: '#E9EAEC',
  				light: '#E6E6E9',
  				lightHover: '#B6BCD3',
  				normal: '#626981',
  				normalDarker: '#252B42',
  				normalHover: '#21273B',
  				normalActive: '#1E2235',
  				dark: '#1C2032',
  				darkHover: '#161A28',
  				darkActive: '#11131E',
  				darker: '#0D0F17'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		keyframes: {
  			marquee: {
  				'0%': {
  					transform: 'translateX(0)'
  				},
  				'100%': {
  					transform: 'translateX(-50%)'
  				}
  			}
  		},
  		animation: {
  			marquee: 'marquee 100s linear infinite'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },

plugins: [addIconSelectors(["mdi-light", "vscode-icons"]), require("tailwindcss-animate")],
};

