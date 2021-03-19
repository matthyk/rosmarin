export abstract class AbstractModel<T extends string | number = number> {
  public id: T

  public lastModifiedAt: number
}
