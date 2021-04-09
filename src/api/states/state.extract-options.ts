export interface ExtractOptions<T> {
  validate?: (value: T) => void
  throwIfUndefined?: boolean
}
