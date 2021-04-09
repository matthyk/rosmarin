import { AbstractPropertyStore } from '../abstract-property-store'
import { AbstractViewModel } from '../../models'

export class ViewMetadataStore<
  T extends AbstractViewModel
> extends AbstractPropertyStore<T> {}

export const viewMetadataStore = new ViewMetadataStore()
