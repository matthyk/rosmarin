import { AbstractModel } from '../abstract-model'
import { LinkProperty } from '../link'
import { Property } from '../../json-schema-builder/view-property'
import constants from '../../constants'

export const convertLinks = <T extends AbstractModel>(
  instance: T,
  url: string
): T => {
  const linkProps: LinkProperty[] =
    Reflect.getMetadata(constants.LINKS, instance.constructor) ?? []

  if (linkProps.length === 0) return instance

  linkProps.forEach((prop: LinkProperty) => {
    let href = prop.href.replace(
      /{.*?}/g,
      (substring: string) =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        instance[substring.substring(1, substring.length - 1)]
    )

    href = url + href
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    instance[prop.property] = {
      href,
      type: prop.type,
      rel: prop.rel,
    }
  })

  const viewProps: Property[] =
    Reflect.getMetadata(constants.VIEW_PROPS, instance.constructor) ?? []

  for (const prop of viewProps) {
    // currently only embedded objects are supported
    if (prop.type.name !== 'Array') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      instance[prop.name] = convertLinks(instance[prop.name], url)
    }
  }

  return instance
}
