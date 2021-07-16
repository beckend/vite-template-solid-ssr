export const once = <ArgumentsType extends unknown[], ReturnType>(
  fn: (...args: ArgumentsType) => ReturnType
) => {
  let called = false
  let result: ReturnType

  return function func(...args: ArgumentsType) {
    if (called) {
      return result
    }

    called = true
    result = fn(...args)
    return result
  }
}
