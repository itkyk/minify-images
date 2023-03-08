export declare type PickType<T, K extends keyof T> = T[K];
export declare class color {
    static green: (log: string) => string;
    static blue: (log: string) => string;
    static red: (log: string) => string;
}
export declare const sleep: (delay: number) => Promise<unknown>;
export declare const customTable: (log: Record<string, any>) => void;
