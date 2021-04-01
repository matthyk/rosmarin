import { Constructor } from '../router/utility-types'
import { SchemaOptions } from './decorators'

export interface Property {
  name: string
  type: Constructor
}

export interface ValidationProperty extends Property {
  schemaOptions: SchemaOptions
}
