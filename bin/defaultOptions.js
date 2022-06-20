"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultSVGOOpts = exports.defaultQuantOpts = exports.defaultOxipngOpts = exports.defaultMozJpegOpts = void 0;
exports.defaultMozJpegOpts = {
    quality: 75,
    baseline: false,
    arithmetic: false,
    progressive: true,
    optimize_coding: true,
    smoothing: 0,
    color_space: 3,
    quant_table: 3,
    trellis_multipass: false,
    trellis_opt_zero: false,
    trellis_opt_table: false,
    trellis_loops: 1,
    auto_subsample: true,
    chroma_subsample: 2,
    separate_chroma_quality: false,
    chroma_quality: 75,
};
exports.defaultOxipngOpts = {
    level: 3,
    interlace: false,
};
exports.defaultQuantOpts = {
    enabled: true,
    zx: 0,
    maxNumColors: 256,
    dither: 1,
};
exports.defaultSVGOOpts = [
    {
        name: "removeAttrs",
        params: {
            attrs: "data-name",
        },
    },
];
