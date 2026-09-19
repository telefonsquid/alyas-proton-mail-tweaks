import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	// The preview pane hands the port down this way
	server: { port: Number(process.env.PORT) || 5173 },

	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
				experimental: { async: true }
			},

			// Node, because the install route writes its CSS per query string and a static export
			// would drop it
			adapter: adapter(),

			experimental: {
				remoteFunctions: true,
				explicitEnvironmentVariables: true,
				handleRenderingErrors: true
			}
		})
	]
});
