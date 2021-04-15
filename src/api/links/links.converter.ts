import { AbstractModel } from '../../models'
import { LinkProperty } from './link'
import { modelMetadataStore, Property } from '../../metadata-stores'

const convertLinksInObject = <T extends AbstractModel>(
  instance: T,
  url: string
): T => {
  if (typeof instance === 'undefined') return instance

  const model = <any>instance

  const linkProperties: LinkProperty[] = modelMetadataStore.getLinkProperties(
    model.constructor
  )

  linkProperties.forEach((prop: LinkProperty) => {
    let href = prop.href.replace(
      /{.*?}/g,
      (substring: string) => model[substring.substring(1, substring.length - 1)]
    )

    href = url + href

    model[prop.property] = {
      href,
      type: prop.type,
      rel: prop.rel,
    }
  })

  const modelProperties: Property[] = modelMetadataStore.getProperties(
    model.constructor
  )

  for (const prop of modelProperties) {
    if (Array.isArray(model[prop.name])) {
      for (let arrayProp of model[prop.name]) {
        arrayProp = convertLinks(arrayProp, url)
      }
    } else if (typeof model[prop.name] === 'object') {
      model[prop.name] = convertLinks(model[prop.name], url)
    } else {
      /* property has a primitive type a cannot be converted */
    }
  }

  return instance
}

export function convertLinks<T extends AbstractModel>(
  instance: T,
  url: string
): T
export function convertLinks<T extends AbstractModel>(
  instance: T[],
  url: string
): T[]
export function convertLinks<T extends AbstractModel>(
  instances: T | T[],
  url: string
): T | T[] {
  if (Array.isArray(instances)) {
    for (let instance of instances) {
      instance = convertLinksInObject(instance, url)
    }
    return instances
  } else {
    return convertLinksInObject(instances, url)
  }
}
