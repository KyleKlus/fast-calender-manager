import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
	plugins: [pluginReact()],
	source: {
		entry: {
			"fast-calender-manager": "./src/web/index.tsx",
		},
	},
	html: {
		title: "Calendar Manager",
		favicon: "./public/calendar-icon.svg",
	},
	server: {
		port: process.env.NODE_ENV === "development" ? 3000 : 8080,
		base: "/",
	},
	output: {
		cssModules: {
			auto: true,
		},
		assetPrefix: "/",
	},
});
