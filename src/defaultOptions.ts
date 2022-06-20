import { PickType } from "./utils";
import { ImageMinOptionInterface } from "./minify";

export type encodeOptionsTypes = PickType<
  ImageMinOptionInterface,
  "encodeOptions"
>;

export const defaultMozJpegOpts: Record<string, any> = {
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

export const defaultOxipngOpts: Record<string, any> = {
  level: 3,
  interlace: false,
};

export const defaultQuantOpts: Record<string, any> = {
  enabled: true,
  zx: 0,
  maxNumColors: 256,
  dither: 1,
};

export const defaultSVGOOpts: Array<any> = [
  {
    name: "removeAttrs",
    params: {
      attrs: "data-name",
    },
  },
];
