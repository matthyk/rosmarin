import { TypeFn } from './type-fn'
import { Constructor } from '../types'

export interface Property {
  name: string
  typeFn?: TypeFn
  type?: Constructor
}
