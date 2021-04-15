export const sanitizeUrl = (url: string): string => {
  return (
    '/' +
    url
      .split(/\//g)
      .filter((s) => s)
      .join('/')
  )
}
