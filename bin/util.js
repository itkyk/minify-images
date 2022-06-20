"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Terminal = void 0;
class Terminal {
}
exports.Terminal = Terminal;
Terminal.logGreen = (log) => {
    console.log(`\u001b[32m${log}\u001b[0m`);
};
Terminal.logBlue = (log) => {
    console.log(`\u001b[34m${log}\u001b[0m`);
};
Terminal.logRed = (log) => {
    console.log(`\u001b[31m${log}\u001b[0m`);
};
