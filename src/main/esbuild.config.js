import { build } from "esbuild";

const config = {
    entryPoints: ["main.ts"],
    bundle: true,
    platform: "node",
    target: "node24",
    outfile: "../../dist/main.js",
    sourcemap: false,
    minify: true,
    external: [
        "electron",
        "pg-hstore",
        "xlsx-style",
        "sqlite3",
        "@serialport/bindings-cpp", 
        "serialport"
    ],
    format: "esm",
    banner: {
        js: "import { createRequire as __createRequire } from 'module';\nconst require = __createRequire(import.meta.url);"
    },
    tsconfig: "tsconfig.json",
    logLevel: "info",
};

build(config)
    .then(() => {
        console.log("Build completed successfully with esbuild!");
    })
    .catch((error) => {
        console.error("Build failed:", error);
        process.exit(1);
    });

