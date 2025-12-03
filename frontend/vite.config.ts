import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");

	const API_URL = env.VITE_API_URL_BASE;
	const MQTT_HOST = env.VITE_MQTT_HOST;
	const MQTT_PORT = env.VITE_MQTT_PORT;

	return {
		base: "/",
		plugins: [
			react(),
			{
				name: "inject-csp-meta",
				transformIndexHtml(html) {
					const csp = [
						"default-src 'self'",
						"script-src 'self'",
						"worker-src 'self' blob:",
						"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
						"font-src 'self' https://fonts.gstatic.com data:",
						"img-src 'self' data:",
						`connect-src 'self' ${API_URL} ${MQTT_HOST}:${MQTT_PORT}`,
						"object-src 'none'",
					].join("; ");

					return html.replace("<!-- CSP_META -->", `<meta http-equiv="Content-Security-Policy" content="${csp}">`);
				},
			},
		],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "src"),
			},
		},
		build: {
			target: "esnext",
			minify: "esbuild",
			cssCodeSplit: true,
			assetsDir: "assets",
			reportCompressedSize: false,
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
	};
});
