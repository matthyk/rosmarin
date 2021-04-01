import { AbstractModel } from '../../abstract-model'
import { ModelId } from '../../types'
import { Constructor } from '../../../router/utility-types'
import { Property } from '../../../json-schema-builder/view-property'
import { ViewModel } from '../../abstract-view-model'
import constants from '../../../constants'

const isPrimitiveValue = (value: unknown): boolean =>
  (typeof value !== 'object' && typeof value !== 'function') || value === null

const shouldMergeProperty = (propertyName: string): boolean =>
  propertyName !== 'id' && propertyName !== 'lastModifiedAt'

const deletePropertyInObject = (object: any, key: string | symbol): void => {
  object[key] = undefined
}

const copyFromSourceToTarget = (
  source: any,
  target: any,
  key: string | symbol
): void => {
  target[key] = source[key]
}

export const merge = <T extends AbstractModel>(
  source: ViewModel,
  target: T
): T => {
  const sourceProperties: Property[] =
    Reflect.getMetadata(constants.VIEW_PROPS, source.constructor) ?? []

  for (const sourceProperty of sourceProperties) {
    const propertyName: string = sourceProperty.name

    if (shouldMergeProperty(propertyName) === false) {
      continue
    }

    const propertyValueInSource = (source as any)[propertyName]

    if (typeof propertyValueInSource === 'undefined') {
      deletePropertyInObject(target, propertyName)
    } else if (isPrimitiveValue(propertyValueInSource)) {
      copyFromSourceToTarget(source, target, propertyName)
    } else if (typeof propertyValueInSource === 'object') {
      // is embedded collection resource?
      if (Array.isArray(propertyValueInSource)) {
        // this should never happen, but if it does the property in the target is simply deleted
        if (Array.isArray((target as any)[propertyName]) === false) {
          ;(target as any)[propertyName] = []
        }

        const propertyValueInTarget: any[] = (target as any)[propertyName]

        for (const resource of propertyValueInSource) {
          const resourceId: ModelId = resource.id

          // check if this resource also exists in the target model
          const found: unknown | undefined = propertyValueInTarget.find(
            (value: any) => value.id == resourceId
          ) // TODO how should we search for this?

          // if it does not exist we have to instantiate it
          if (typeof found === 'undefined') {
            // for this we need the type so we need metadata of this property
            const metaData: any = Reflect.getMetadata(
              constants.VIEW_ARRAY_PROPS,
              target.constructor
            )
            const typeOfProperty = metaData[propertyName]

            const newInstance = new typeOfProperty()

            ;(target as any)[propertyName].push(newInstance)

            merge(resource, newInstance)
          } else {
            merge(resource, found as AbstractModel)
          }
        }

        for (let i = 0; i < propertyValueInTarget.length; i++) {
          const resourceId = propertyValueInTarget[i].id

          if (
            typeof propertyValueInSource.find((e) => e.id == resourceId) ===
            'undefined'
          ) {
            propertyValueInTarget.splice(i, 1)
          }
        }

        // copyFromSourceToTarget(source, target, propertyName)
      } else {
        // object property is not set in the target model and has to be instantiated
        if (typeof (target as any)[propertyName] === 'undefined') {
          // to do this we need the type of this property in the target model
          const typeInTarget: Constructor = Reflect.getMetadata(
            'design:type',
            target,
            propertyName
          ) as Constructor

          ;(target as any)[propertyName] = new typeInTarget()
          // normally the 'id' attribute is ignored but should be set here
          copyFromSourceToTarget(
            (source as any)[propertyName],
            (target as any)[propertyName],
            'id'
          )
        }
        // then just continue to merge
        merge((source as any)[propertyName], (target as any)[propertyName])
      }
    } else {
      /* type of property is function and is ignored */
    }
  }
  return target
}
