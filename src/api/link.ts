import { Target } from '../router/utility-types'
import constants from '../constants'

export interface Link {
  href: string
  rel: string
  type: string
}

export interface LinkProperty extends Link {
  property: string
}

export const link = (href: string, rel: string, type: string) => (
  target: Target,
  key: string | symbol
) => {
  const currentLinks: LinkProperty[] =
    Reflect.getMetadata(constants.LINKS, target.constructor) ?? []

  const link: LinkProperty = {
    href,
    rel,
    type,
    property: key.toString(),
  }

  currentLinks.push(link)

  Reflect.defineMetadata(constants.LINKS, currentLinks, target.constructor)
}
