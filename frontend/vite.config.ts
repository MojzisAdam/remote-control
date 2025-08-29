import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					// Split vendor libraries into separate chunks
					"vendor-react": ["react", "react-dom", "react-router-dom"],
					"vendor-ui": [
						"@radix-ui/react-dialog",
						"@radix-ui/react-dropdown-menu",
						"@radix-ui/react-select",
						"@radix-ui/react-tabs",
						"@radix-ui/react-slider",
						"@radix-ui/react-switch",
						"@radix-ui/react-toast",
						"@radix-ui/react-tooltip",
					],
					"vendor-charts": ["chart.js", "react-chartjs-2", "chartjs-adapter-date-fns", "chartjs-plugin-zoom", "recharts"],
					"vendor-utils": ["axios", "date-fns", "i18next", "react-i18next", "mqtt", "clsx", "tailwind-merge"],
					// Split parameter JSON files into separate chunks
					parameters: ["/src/jsons/parameters.json", "/src/jsons/parameters_cz.json"],
					"parameters-daitsu": ["/src/jsons/parameters_daitsu.json", "/src/jsons/parameters_daitsu_cz.json"],
				},
			},
		},
		chunkSizeWarningLimit: 1000,
	},
});
