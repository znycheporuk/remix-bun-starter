import { broadcastDevReady, createRequestHandler } from "@remix-run/server-runtime";
import { statSync } from "fs";


const BUILD_PATH = "./build/index.js";
const STATIC_PATH = "./public";

let build = await import(BUILD_PATH);

if (build.dev) {
	broadcastDevReady(build);
}

Bun.serve({
	async fetch(request) {
		const url = new URL(request.url);

		try {
			const filePath = STATIC_PATH + url.pathname;
			if (statSync(filePath).isFile()) {
				const file = Bun.file(filePath);
				return new Response(file);
			}
		} catch {
			// ignore
		}

		build = await import(BUILD_PATH);
		const handler = createRequestHandler(build, process.env.NODE_ENV);

		const loadContext = {};

		return handler(request, loadContext);
	},
	error() {
		return new Response(null, {status: 404});
	},
});
