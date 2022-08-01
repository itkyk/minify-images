"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-ignore
const lib_1 = require("@squoosh/lib");
const os_1 = require("os");
const svgo_1 = require("svgo");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const glob_1 = __importDefault(require("glob"));
const deepmerge_1 = __importDefault(require("deepmerge"));
const is_plain_object_1 = require("is-plain-object");
const utils_1 = require("./utils");
const defaultOptions_1 = require("./defaultOptions");
let imagePoolList;
class ImageMin {
    constructor(options) {
        var _a, _b, _c, _d;
        this.encodeJPG_and_PNG = () => __awaiter(this, void 0, void 0, function* () {
            const imageFiles = glob_1.default.sync(`${this.inputPath}/**/*.{jpg,jpeg,png}`);
            imagePoolList = imageFiles.map((fileName) => {
                const imageFile = fs_1.default.readFileSync(`${fileName}`);
                let image = this.imagePool.ingestImage(imageFile);
                return { name: fileName, image };
            });
            yield this.attachmentQuant();
            yield this.minifyImage();
            yield this.outputImages();
            this.imagePool.close();
        });
        this.encodeSvg = () => __awaiter(this, void 0, void 0, function* () {
            const svgFiles = glob_1.default.sync(`${this.inputPath}/**/*.svg`);
            for (const file of svgFiles) {
                yield this.minifySvg(file);
            }
        });
        this.attachmentQuant = () => __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(imagePoolList.map((item) => __awaiter(this, void 0, void 0, function* () {
                const { image } = item;
                if (/\.(png)$/i.test(item.name)) {
                    yield image.decode;
                    return yield image.preprocess({
                        quant: this.quantOpts,
                    });
                }
            }))).catch(() => {
                console.log("error1");
            });
        });
        this.minifyImage = () => __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(imagePoolList.map((item) => __awaiter(this, void 0, void 0, function* () {
                const { image } = item;
                if (/\.(jpe?g)$/i.test(item.name)) {
                    yield image.encode({
                        mozjpeg: this.mozjpegOpts,
                    });
                }
                if (/\.(png)$/i.test(item.name)) {
                    yield image.encode({
                        oxipng: this.oxipngOpts,
                    });
                }
            }))).catch(() => {
                console.log("error2");
            });
        });
        this.outputImages = () => __awaiter(this, void 0, void 0, function* () {
            for (const item of imagePoolList) {
                const { name, image: { encodedWith }, } = item;
                // 圧縮したデータを格納する変数
                let data;
                // JPGならMozJPEGで圧縮したデータを取得
                if (encodedWith.mozjpeg) {
                    data = yield encodedWith.mozjpeg;
                }
                // PNGならOxiPNGで圧縮したデータを取得
                if (encodedWith.oxipng) {
                    data = yield encodedWith.oxipng;
                }
                // ファイルを書き込む
                const outputPath = name.replace(this.inputPath, this.outputPath);
                this.diggerDirectory(outputPath);
                (0, utils_1.sleep)(1000).then(() => __awaiter(this, void 0, void 0, function* () {
                    if (data) {
                        const inputSize = fs_1.default.statSync(item.name).size;
                        // @ts-ignore
                        const outputSize = data.size;
                        if (inputSize > outputSize) {
                            // @ts-ignore
                            yield fs_1.default.writeFileSync(`${outputPath}`, data.binary);
                            (0, utils_1.customTable)({
                                Encoded: outputPath,
                                minify: `${100 - (outputSize / inputSize) * 100}%`,
                            });
                        }
                        else {
                            yield fs_1.default.copyFileSync(item.name, outputPath);
                            (0, utils_1.customTable)({
                                Encoded: outputPath,
                                minify: `0%`,
                            });
                        }
                    }
                    else {
                        fs_1.default.copyFileSync(item.name, outputPath);
                        (0, utils_1.customTable)({
                            Encoded: outputPath,
                            minify: `0%`,
                        });
                    }
                }));
            }
        });
        this.minifySvg = (svgPath) => __awaiter(this, void 0, void 0, function* () {
            const svgString = fs_1.default.readFileSync(svgPath);
            const svgResult = (0, svgo_1.optimize)(svgString, {
                path: svgPath,
                multipass: true,
                plugins: this.svgoOpts,
            });
            if ("data" in svgResult) {
                const optimizedSvgString = svgResult.data;
                const outPutInnerDir = svgPath.replace(this.inputPath, this.outputPath);
                this.diggerDirectory(outPutInnerDir);
                fs_1.default.writeFileSync(outPutInnerDir, optimizedSvgString);
                const outputSize = fs_1.default.statSync(outPutInnerDir).size;
                const inputSize = fs_1.default.statSync(svgPath).size;
                (0, utils_1.customTable)({
                    Encoded: outPutInnerDir,
                    minify: `${100 - (outputSize / inputSize) * 100}%`,
                });
            }
        });
        this.diggerDirectory = (pathName) => {
            const ex = path_1.default.extname(pathName);
            const fileDir = pathName.split("/").filter((val) => {
                if (val !== "" && !val.includes(ex))
                    return val;
            });
            let outPutDir = "/";
            for (const innerDir of fileDir) {
                outPutDir = path_1.default.join(outPutDir, innerDir);
                if (!fs_1.default.existsSync(outPutDir)) {
                    fs_1.default.mkdirSync(outPutDir);
                }
            }
        };
        this.mergeObject = (base, add) => {
            return (0, deepmerge_1.default)(base, add, {
                isMergeableObject: is_plain_object_1.isPlainObject,
            });
        };
        this.mozjpegOpts = this.mergeObject(((_a = options.encodeOptions) === null || _a === void 0 ? void 0 : _a.mozjpeg) || {}, defaultOptions_1.defaultMozJpegOpts || {});
        this.oxipngOpts = this.mergeObject(((_b = options.encodeOptions) === null || _b === void 0 ? void 0 : _b.oxipng) || {}, defaultOptions_1.defaultOxipngOpts || {});
        this.quantOpts = this.mergeObject(((_c = options.encodeOptions) === null || _c === void 0 ? void 0 : _c.quant) || {}, defaultOptions_1.defaultQuantOpts || {});
        this.svgoOpts = ((_d = options.encodeOptions) === null || _d === void 0 ? void 0 : _d.svgo) || defaultOptions_1.defaultSVGOOpts;
        this.inputPath = path_1.default.resolve(options.inputPath);
        this.outputPath = path_1.default.resolve(options.outputPath);
        this.imagePool = new lib_1.ImagePool((0, os_1.cpus)().length);
        this.encodeJPG_and_PNG().then();
        this.encodeSvg().then();
    }
}
exports.default = ImageMin;
