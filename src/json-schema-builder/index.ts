import 'reflect-metadata'
import { collectionView, viewProp } from "./decorators";
import { buildSchema } from "./schema-builder";
import * as util from 'util'

@collectionView()
class CollectionView {
  @viewProp()
  s: string

  @viewProp()
  n: number
}

console.log(util.inspect( buildSchema( CollectionView ), false, null, true /* enable colors */) )
export * from './decorators'
export * from './schema-builder'
export * from './view-property'
