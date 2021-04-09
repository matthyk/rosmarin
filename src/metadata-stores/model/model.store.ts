import { Constructor } from '../../utility-types'
import { AbstractModel } from '../../models'
import { LinkProperty } from '../../api'
import { AbstractPropertyStore } from '../abstract-property-store'

export class ModelMetadataStore<
  T extends AbstractModel
> extends AbstractPropertyStore<T> {
  private links = new Map<Constructor<AbstractModel>, LinkProperty[]>()

  public addLinkProperty<T extends AbstractModel>(
    ctor: Constructor<T>,
    link: LinkProperty
  ): void {
    if (this.links.has(ctor) === false) {
      this.links.set(ctor, [])
    }

    this.links.get(ctor).push(link)
  }

  public getLinkProperties<T extends AbstractModel>(
    ctor: Constructor<T>
  ): LinkProperty[] {
    return this.links.get(ctor) ?? []
  }

  public isLinkProperty<T extends AbstractModel>(
    ctor: Constructor<T>,
    propertyName: string
  ): LinkProperty {
    return this.getLinkProperties(ctor).find(
      (linkProperty: LinkProperty) => linkProperty.property === propertyName
    )
  }
}

export const modelMetadataStore = new ModelMetadataStore()
