import { Constructor } from '../../utility-types'
import { AbstractViewModel } from '../../models'
import { SchemaOptions } from '../../api'
import { ValidationProperty } from './validation-property'
import { AbstractMetadataStore } from '../abstract-metadata-store'

export class ValidationMetadataStore extends AbstractMetadataStore {
  private viewSchemaOptions = new Map<
    Constructor<AbstractViewModel>,
    SchemaOptions
  >()

  private collectionViewSchemaOptions = new Map<
    Constructor<AbstractViewModel>,
    SchemaOptions
  >()

  private validationProperties = new Map<
    Constructor<AbstractViewModel>,
    ValidationProperty[]
  >()

  public addSchemaForView<T extends AbstractViewModel>(
    ctor: Constructor<T>,
    schemaOptions: SchemaOptions
  ): void {
    this.viewSchemaOptions.set(ctor, schemaOptions)
  }

  public getSchemaForView<T extends AbstractViewModel>(
    ctor: Constructor<T>
  ): SchemaOptions | undefined {
    return this.viewSchemaOptions.get(ctor)
  }

  public addSchemaForCollectionView<T extends AbstractViewModel>(
    ctor: Constructor<T>,
    schemaOptions: SchemaOptions
  ): void {
    this.collectionViewSchemaOptions.set(ctor, schemaOptions)
  }

  public getSchemaForCollectionView<T extends AbstractViewModel>(
    ctor: Constructor<T>
  ): SchemaOptions | undefined {
    return this.collectionViewSchemaOptions.get(ctor)
  }

  public addValidationProperty<T extends AbstractViewModel>(
    ctor: Constructor<T>,
    validationProperty: ValidationProperty
  ): void {
    if (this.validationProperties.has(ctor) === false) {
      this.validationProperties.set(ctor, [])
    }

    this.validationProperties.get(ctor).push(validationProperty)
  }

  public getValidationProperties<T extends AbstractViewModel>(
    ctor: Constructor<T>
  ): ValidationProperty[] {
    return this.mergeMapWithArrays(ctor, this.validationProperties) ?? []
  }

  public getValidationProperty<T extends AbstractViewModel>(
    ctor: Constructor<T>,
    propertyName: string
  ): ValidationProperty | undefined {
    return this.getValidationProperties(ctor).find(
      (validationProperty: ValidationProperty) =>
        validationProperty.name === propertyName
    )
  }
}

export const validationMetadataStore = new ValidationMetadataStore()
