
export type ValueOf<T> = T[keyof T];

export type DeepValueOf<T> = T extends object
  ? { [K in keyof T]: DeepValueOf<T[K]> }[keyof T]
  : T;