import { Constructor } from '../../types'
import { AbstractViewModel } from '../../models'
import { SchemaOptions } from '../../api'
import { ValidationProperty } from './validation-property'
import { AbstractPropertyStore } from '../abstract-property-store'

/**
 * Currently does not support inheritance
 */
export class ValidationMetadataStore<
  T extends AbstractViewModel
> extends AbstractPropertyStore<T, ValidationProperty> {
  private viewSchemaOptions = new Map<
    Constructor<AbstractViewModel>,
    SchemaOptions
  >()

  private collectionViewSchemaOptions = new Map<
    Constructor<AbstractViewModel>,
    SchemaOptions
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
}

export const validationMetadataStore = new ValidationMetadataStore()
