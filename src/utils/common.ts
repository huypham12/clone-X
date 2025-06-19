export const numberEnumToArray = (numberEnum: { [key: string]: string | number }): number[] => {
  return Object.values(numberEnum).filter((value) => typeof value === 'number') as number[]
}
