// it is bad to do it this way but just too lazy to do it better now
// in addition, the arrays with which the method is called are very small
export const hasDuplicate = <T>(
  array: T[],
  compareFn: (a: T, b: T) => boolean
): T | undefined => {
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array.length; j++) {
      if (i === j) continue

      if (compareFn(array[i], array[j])) {
        return array[i]
      }
    }
  }

  return undefined
}
