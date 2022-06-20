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
const fs_extra_1 = __importDefault(require("fs-extra"));
const glob_1 = __importDefault(require("glob"));
const deepmerge_1 = __importDefault(require("deepmerge"));
const is_plain_object_1 = require("is-plain-object");
const defaultOptions_1 = require("./defaultOptions");
class ImageMin {
    constructor(options) {
        var _a, _b, _c;
        this.encodeJPG_and_PNG = () => __awaiter(this, void 0, void 0, function* () {
            const imageFiles = glob_1.default.sync(`${this.inputPath}/**/*.{jpg,jpeg,png,svg}`);
            const imagePoolList = imageFiles.map((fileName) => {
                const imageFile = fs_extra_1.default.readFileSync(`${fileName}`);
                let image;
                try {
                    image = this.imagePool.ingestImage(imageFile);
                    throw new Error("cannot catch");
                }
                catch (e) {
                    console.log(e);
                }
                return { name: fileName, image };
            });
            yield this.attachmentQuant(imagePoolList);
            yield this.minifyImage(imagePoolList);
            this.imagePool.close();
        });
        this.attachmentQuant = (fileList) => __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(fileList.map((item) => __awaiter(this, void 0, void 0, function* () {
                const { image } = item;
                if (/\.(png)$/i.test(item.name)) {
                    yield image.decode;
                    return yield image.preprocess(this.quantOpts);
                }
            }))).catch(() => {
                console.log("error1");
            });
        });
        this.minifyImage = (fileList) => __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(fileList.map((item) => __awaiter(this, void 0, void 0, function* () {
                const { image } = item;
                if (/\.(jpe?g)$/i.test(item.name)) {
                    yield image.encode(this.mozjpegOpts);
                }
                if (/\.(png)$/i.test(item.name)) {
                    yield image.encode(this.oxipngOpts);
                }
                if (/\.(svg)$/i.test(item.name)) {
                    const svgString = fs_extra_1.default.readFileSync(item.name);
                    const svgResult = (0, svgo_1.optimize)(svgString, {
                        path: item.name,
                        multipass: true,
                        plugins: [
                            {
                                name: "removeAttrs",
                                params: {
                                    attrs: "data-name",
                                },
                            },
                        ],
                    });
                    if ("data" in svgResult) {
                        const optimizedSvgString = svgResult.data;
                        const itemName = path_1.default.basename(item.name);
                        console.log(typeof optimizedSvgString, itemName);
                        if (!fs_extra_1.default.existsSync(this.outputPath)) {
                            fs_extra_1.default.mkdirSync(this.outputPath);
                        }
                        fs_extra_1.default.writeFileSync(path_1.default.join(this.outputPath, itemName), optimizedSvgString);
                    }
                }
            }))).catch(() => {
                console.log("error2");
            });
        });
        this.encodeSvg = () => { };
        this.mergeObject = (base, add) => {
            return (0, deepmerge_1.default)(base, add, {
                isMergeableObject: is_plain_object_1.isPlainObject,
            });
        };
        this.mozjpegOpts = this.mergeObject(((_a = options.encodeOptions) === null || _a === void 0 ? void 0 : _a.mozjpeg) || {}, defaultOptions_1.defaultMozJpegOpts || {});
        this.oxipngOpts = this.mergeObject(((_b = options.encodeOptions) === null || _b === void 0 ? void 0 : _b.oxipng) || {}, defaultOptions_1.defaultOxipngOpts || {});
        this.quantOpts = this.mergeObject(((_c = options.encodeOptions) === null || _c === void 0 ? void 0 : _c.quant) || {}, defaultOptions_1.defaultQuantOpts || {});
        this.inputPath = path_1.default.resolve(options.inputPath);
        this.outputPath = path_1.default.resolve(options.outputPath);
        this.imagePool = new lib_1.ImagePool((0, os_1.cpus)().length);
        this.encodeJPG_and_PNG().then();
    }
}
exports.default = ImageMin;
