import { Constructor } from '../types'

export type TypeFn<T = unknown> = () => Constructor<T>
