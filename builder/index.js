const esBuild = require("esbuild");
const { dependencies } = require("../package.json");
const glob = require("glob");
const fs = require("fs");
const rimraf = require("rimraf");

const init = async () => {
  await rimraf.sync("./bin");
  await esBuild.build({
    entryPoints: ["./src/index.ts", "./src/minify.ts"],
    platform: "node",
    format: "esm",
    outdir: "./bin/",
    bundle: true,
    external: Object.keys(dependencies),
    target: "node12",
  });
  const esmFiles = glob.sync("./bin/**.js", {
    ignore: "./bin/**/*.cjs.js",
    nodir: true,
  });

  for (const file of esmFiles) {
    fs.copyFileSync(file, file.replace(".js", ".ems.js"));
  }

  await esBuild.build({
    entryPoints: ["./src/index.ts", "./src/minify.ts"],
    bundle: true,
    platform: "node",
    format: "cjs",
    outdir: "./bin/",
    target: "node12",
    external: Object.keys(dependencies),
  });

  const cjsFiles = glob.sync("./bin/**.js", {
    ignore: "./bin/**/*.ems.js",
    nodir: true,
  });

  for (const file of cjsFiles) {
    fs.copyFileSync(file, file.replace(".js", ".cjs.js"));
  }
};

init().then();
