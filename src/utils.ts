export type PickType<T, K extends keyof T> = T[K];
export class color {
  static green = (log: string) => {
    return `\u001b[32m${log}\u001b[0m`;
  };

  static blue = (log: string) => {
    return `\u001b[34m${log}\u001b[0m`;
  };

  static red = (log: string) => {
    return `\u001b[31m${log}\u001b[0m`;
  };
}

export const customTable = (log: Record<string, any>) => {
  const topLeft = "┌";
  const topRight = "┐";
  const bottomLeft = "└";
  const bottomRight = "┘";
  const verticalLine = "│";
  const getMaxLength = () => {
    let maxLen = 0;
    Object.keys(log).forEach((key) => {
      const outPutStr = `${key}: ${log[key]}`;
      if (maxLen <= outPutStr.length) {
        maxLen = outPutStr.length;
      }
    });
    return maxLen;
  };
  const injectSpace = (num: number) => {
    let spaces = "";
    for (let i = 0; i < num; i++) {
      spaces = spaces + " ";
    }
    return spaces;
  };
  const maxLength = getMaxLength() + 2;
  let line = [...Array(maxLength)].map((_, i) => "─");
  console.log(topLeft + line.join("") + topRight);
  Object.keys(log).forEach((key) => {
    console.log(
      verticalLine +
        color.green(
          " " +
            key +
            ": " +
            log[key] +
            " " +
            injectSpace(
              maxLength +
                2 -
                `${verticalLine} ${key}: ${log[key]} ${verticalLine}`.length
            )
        ) +
        verticalLine
    );
  });
  console.log(bottomLeft + line.join("") + bottomRight);
};
