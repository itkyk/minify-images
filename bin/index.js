"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const minify_1 = __importDefault(require("./minify"));
const program = new commander_1.Command();
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
        if (key.includes("oxipng") ||
            key.includes("mozjpeg") ||
            key.includes("quant")) {
            if (opts[key]) {
                opts[key] = JSON.parse(opts[key]);
            }
        }
    });
};
parseOptions();
const includesOptions = (key, value) => {
    if (value) {
        return {
            [key]: value,
        };
    }
    else {
        return {};
    }
};
const transformOptions = {
    inputPath: opts.input,
    outputPath: opts.output,
    encodeOptions: Object.assign(Object.assign(Object.assign({}, includesOptions("mozjpeg", opts.mozjpeg)), includesOptions("oxipng", opts.oxipng)), includesOptions("quant", opts.quant)),
};
console.log(transformOptions);
new minify_1.default(transformOptions);
