export type TArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never
export type TUnpacked<T> = T extends (infer U)[] ? U : T
