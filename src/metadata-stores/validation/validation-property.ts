import { SchemaOptions } from '../../api'
import { Property } from '../property'

export interface ValidationProperty extends Property {
  schemaOptions: SchemaOptions
}
