import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src"],
  bundle: true,
  outdir: "build",
  platform: "node",
  banner: {
    js: "import { createRequire as topLevelCreateRequire } from 'module';\n const require = topLevelCreateRequire(import.meta.url);",
  },
});
