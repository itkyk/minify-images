import { Command } from "commander";
import ImageMin, { ImageMinOptionInterface } from "./minify";
const program = new Command();

program
  .requiredOption("-o, --output <value>", "output dir")
  .requiredOption("-i, --input <value>", "input dir")
  .option("-m, --mozjpeg <value>", "mozjpeg encode option")
  .option("-ox, --oxipng <value>", "oxipng encode option")
  .option("-q, --quant <value>", "quant option");
program.parse(process.argv);

const opts = program.opts();

const parseOptions = () => {
  Object.keys(opts).forEach((key) => {
    if (
      key.includes("oxipng") ||
      key.includes("mozjpeg") ||
      key.includes("quant")
    ) {
      if (opts[key]) {
        opts[key] = JSON.parse(opts[key]);
      }
    }
  });
};

parseOptions();

const includesOptions = (key: string, value: object | null) => {
  if (value) {
    return {
      [key]: value,
    };
  } else {
    return {};
  }
};

const transformOptions: ImageMinOptionInterface = {
  inputPath: opts.input,
  outputPath: opts.output,
  encodeOptions: {
    ...includesOptions("mozjpeg", opts.mozjpeg),
    ...includesOptions("oxipng", opts.oxipng),
    ...includesOptions("quant", opts.quant),
  },
};

console.log(transformOptions);

new ImageMin(transformOptions);
