import { Constructor } from '../utility-types'

export type TypeFn<T = unknown> = () => Constructor<T>
