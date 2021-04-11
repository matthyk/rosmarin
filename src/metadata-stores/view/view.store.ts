import { AbstractPropertyStore } from '../abstract-property-store'
import { AbstractViewModel } from '../../models'
import { Property } from '../property'

export class ViewMetadataStore<
  T extends AbstractViewModel
> extends AbstractPropertyStore<T, Property> {}

export const viewMetadataStore = new ViewMetadataStore()
