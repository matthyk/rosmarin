import { Constructor, Target } from '../../router/utility-types'
import { AbstractModel } from '../abstract-model'
import { Link } from '../link'
import constants from '../../constants'

export const prop = (target: Target, propertyKey: string): void => {
  const props: string[] =
    Reflect.getMetadata(constants.VIEW_P, target.constructor) ?? []

  props.push(propertyKey)

  Reflect.defineMetadata(constants.VIEW_P, props, target.constructor)
}

export type Converter<From, To = AbstractModel> = (from: From) => To

export type GeneratedConverter<From, To = AbstractModel> = (
  from: From,
  to: To
) => To

export const convertTo = <From, To>(
  to: Constructor<To>
): Converter<From, To> => {
  return (from: From): To => {
    const props: string[] = Reflect.getMetadata(constants.VIEW_P, to)

    const instance = new to()

    for (const prop of props) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (from[prop]) instance[prop] = from[prop]
    }

    return instance
  }
}

export const generateConvertTo = <From, To>(
  convertTo: Constructor<To>
): Converter<From, To> => {
  const props: string[] = Reflect.getMetadata(constants.VIEW_P, convertTo)

  let propValues = ''
  props.forEach((prop) => {
    propValues += `instance['${prop}'] = from['${prop}']\n`
  })

  const fn = `
    'use strict'
    
    return (function (from) {
      const instance = new to()
      
      ${propValues}
      
      return instance
      
     })
  `

  return Function.apply(null, ['to', fn]).apply(null, [convertTo])
}

export const generateConvertToWithLinks = <From, To>(
  from: Constructor<From>,
  convertTo: Constructor<To>
) => {
  const props: string[] = Reflect.getMetadata(constants.VIEW_P, convertTo)
  console.log('#########################')
  const links: (Link & { property: string | symbol })[] =
    Reflect.getMetadata(constants.LINKS, from) ?? []

  let code = ''

  links.forEach((link) => {
    if (props.includes(link.property.toString()))
      code += `
        instance['${link.property.toString()}'] = {
            rel: '${link.rel}',
            type: '${link.type}',
            href: baseUrl + '${
              link.href
            }'.replace(/{.*?}/g, function(substring) {
              return from[substring.substring(1, substring.length - 1)]
            })
          }\n
      `
  })

  props.forEach((prop) => {
    if (!links.find((l) => l.property.toString() === prop))
      code += `instance['${prop}'] = from['${prop}']\n`
  })

  const fn = `
    'use strict'
    
    return (function (from, baseUrl) {
      const instance = new to()
      
      ${code}
      
      return instance
      
     })
  `
  console.log(fn)
  return Function.apply(null, ['to', fn]).apply(null, [convertTo])
}
