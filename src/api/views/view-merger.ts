import { AbstractModel, AbstractViewModel, ModelId } from '../../models'
import { Constructor } from '../../types'
import {
  modelMetadataStore,
  Property,
  viewMetadataStore,
} from '../../metadata-stores'
import Pino, { Logger } from 'pino'

const isPrimitiveValue = (value: unknown): boolean =>
  (typeof value !== 'object' && typeof value !== 'function') || value === null

const shouldMergeProperty = (propertyName: string): boolean =>
  propertyName !== 'id' && propertyName !== 'lastModifiedAt'

const deletePropertyInObject = (object: any, key: string | symbol): void => {
  object[key] = undefined
}

export const isConstructorOfPrimitiveValue = (
  ctor: Constructor<unknown>
): boolean => {
  return (
    ctor.name.toLowerCase() === 'string' ||
    ctor.name.toLowerCase() === 'number' ||
    ctor.name.toLowerCase() === 'bigint ' ||
    ctor.name.toLowerCase() === 'boolean'
  )
}

const copyFromSourceToTarget = (
  source: any,
  target: any,
  key: string | symbol
): void => {
  target[key] = source[key]
}

// wow this is messy and someone should refactor this
export const merge = <T extends AbstractModel>(
  source: AbstractViewModel,
  target: T,
  logger: Logger = Pino({ prettyPrint: true, level: 'info' })
): T => {
  try {
    const sourceProperties: Property[] = viewMetadataStore.getProperties(
      source.constructor as Constructor<AbstractViewModel>
    )

    for (const sourceProperty of sourceProperties) {
      const propertyName: string = sourceProperty.name

      if (shouldMergeProperty(propertyName) === false) {
        continue
      }

      const propertyValueInSource = (source as any)[propertyName]

      if (typeof propertyValueInSource === 'undefined') {
        logger.trace(
          `DELETE property "${sourceProperty.name}" in model "${target.constructor.name}".`
        )

        deletePropertyInObject(target, propertyName)
      } else if (isPrimitiveValue(propertyValueInSource)) {
        logger.trace(
          `COPY property "${sourceProperty.name}" from view "${source.constructor.name}" in model "${target.constructor.name}".`
        )

        copyFromSourceToTarget(source, target, propertyName)
      } else if (typeof propertyValueInSource === 'object') {
        // is embedded collection resource?
        if (Array.isArray(propertyValueInSource)) {
          logger.trace('Identified embedded collection resource.')

          // Array is not initialized in target
          if (Array.isArray((target as any)[propertyName]) === false) {
            ;(target as any)[propertyName] = []
          }

          const propertyValueInTarget: any[] = (target as any)[propertyName]

          let constructor = modelMetadataStore.getPropertyType<AbstractModel>(
            target.constructor as Constructor<AbstractModel>,
            propertyName
          )

          if (typeof constructor === 'undefined') {
            logger.warn(
              `ViewMerger cannot determine the type of the embedded collection resource "${propertyName}" in model "${target.constructor.name}". ` +
                `An attempt is made to find out the type via existing resources in the model. This is undesirable behavior and should be fixed. ` +
                `Did you annotate the property with @arrayModelProp(() => type)?`
            )

            if ((target as any)[propertyName].length > 0) {
              constructor = (target as any)[propertyName][0].constructor

              logger.trace(
                `Type "${constructor.name}" is determined and set as type of the embedded collection resource.`
              )
            } else {
              logger.trace(
                'The type cannot be determined. Please fix this issue. Any resource in the view that cannot be found in the model is skipped.'
              )
            }
          } else if (isConstructorOfPrimitiveValue(constructor)) {
            ;(target as any)[propertyName] = (source as any)[propertyName]
          } else {
            for (const resource of propertyValueInSource) {
              const resourceId: ModelId = resource.id

              // check if this resource also exists in the target model
              const found: unknown | undefined = propertyValueInTarget.find(
                (value: any) => value.id == resourceId
              ) // TODO how should we search for this?

              // if it does not exist we have to instantiate it
              if (
                typeof found === 'undefined' &&
                typeof constructor !== 'undefined'
              ) {
                const newInstance = new constructor()

                ;(target as any)[propertyName].push(newInstance)

                merge(resource, newInstance)
              } else if (typeof found !== 'undefined') {
                merge(resource, found as AbstractModel)
              } else {
                logger.trace(
                  `Resource in view ${source.constructor.name}${
                    resourceId ? ' with ID ' + resourceId : ''
                  } is skipped.`
                )
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
          }

          // copyFromSourceToTarget(source, target, propertyName)
        } else {
          // object property is not set in the target model and has to be instantiated
          if (typeof (target as any)[propertyName] === 'undefined') {
            logger.trace(
              `Embedded resource "${propertyName}" is undefined in target model "${target.constructor.name}" and must be initialized.`
            )

            // to do this we need the type of this property in the target model
            const constructor:
              | Constructor<AbstractModel>
              | undefined = modelMetadataStore.getPropertyType(
              target.constructor as Constructor<AbstractModel>,
              propertyName
            )

            if (typeof constructor === 'undefined') {
              logger.warn(
                `ViewMerger cannot determine the type of the embedded resource "${propertyName}" of model "${target.constructor.name}". ` +
                  `A plain javascript object will be used instead. This is not intended and may result in undefined behavior. ` +
                  `Did you annotate the property with @modelProp?`
              )
              ;(target as any)[propertyName] = {}
            } else {
              ;(target as any)[propertyName] = new constructor()
            }

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
        logger.trace(
          `Property "${propertyName}" in view "${source.constructor.name}" has type "function" and is ignored.`
        )
      }
    }
    return target
  } catch (e) {
    logger.error(
      `An unexpected error occurred while merging the view "${source.constructor.name}" in the model "${target.constructor.name}". The model merged this far is returned. ${e.stack}`
    )

    return target
  }
}
