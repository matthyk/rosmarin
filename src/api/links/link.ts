export interface Link {
  href: string
  rel: string
  type: string
}

export interface LinkProperty extends Link {
  property: string
}
