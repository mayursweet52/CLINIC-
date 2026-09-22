import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: "class",
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				'50': '#f0fdfa',
  				'100': '#ccfbf1',
  				'200': '#99f6e4',
  				'300': '#5eead4',
  				'400': '#2dd4bf',
  				'500': '#14b8a6',
  				'600': '#0d9488',
  				'700': '#0f766e',
  				'800': '#115e59',
  				'900': '#134e4a',
  				'950': '#042f2e',
  				DEFAULT: '#14b8a6',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			success: {
  				DEFAULT: '#10b981',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			warning: {
  				DEFAULT: '#f59e0b',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			danger: {
  				DEFAULT: '#ef4444',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			info: {
  				DEFAULT: '#3b82f6',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
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
  		fontFamily: {
  			sans: [
  				'var(--font-inter)',
  				'system-ui'
  			]
  		},
  		borderRadius: {
  			lg: '10px',
  			xl: '14px',
  			'2xl': '18px',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  			md: '0 4px 6px -1px rgb(0 0 0 / 0.07)',
  			lg: '0 10px 15px -3px rgb(0 0 0 / 0.08)',
  			xl: '0 20px 25px -5px rgb(0 0 0 / 0.08)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
