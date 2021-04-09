import { Constructor, Target } from '../../utility-types'
import { modelMetadataStore } from '../../metadata-stores'
import { AbstractModel } from '../../models'
import { LinkProperty } from './link'

// TODO duplicated code fragment
const sanitizeUrl = (url: string): string => {
  return (
    '/' +
    url
      .split(/\//g)
      .filter((s) => s)
      .join('/')
  )
}

export const link = (href: string, rel: string, type: string) => {
  return (target: Target, key: string | symbol) => {
    const link: LinkProperty = {
      href: sanitizeUrl(href),
      rel,
      type,
      property: key.toString(),
    }

    modelMetadataStore.addLinkProperty(
      target.constructor as Constructor<AbstractModel>,
      link
    )
  }
}
