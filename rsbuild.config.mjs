import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
	plugins: [pluginReact()],
	html: {
		title: "Calendar Manager",
	},
	server: {
		port: process.env.NODE_ENV === "development" ? 3000 : 8080,
		base: "/fast-calender-manager/",
	},
	output: {
		cssModules: {
			auto: true,
		},
		assetPrefix: "/fast-calender-manager/",
	},
});
