export class CacheControl {
  private _public = false
  private _private = false
  private _mustRevalidate = false
  private _noCache = false
  private _noStore = false
  private _noTransform = false
  private _maxAge = 0

  public get private(): CacheControl {
    this._private = true
    this._public = false
    return this
  }

  public get public(): CacheControl {
    this._public = true
    this._private = false
    return this
  }

  public get mustRevalidate(): CacheControl {
    this._mustRevalidate = true
    return this
  }

  public get noCache(): CacheControl {
    this._noCache = true
    return this
  }

  public get noStore(): CacheControl {
    this._noStore = true
    return this
  }

  public get noTransform(): CacheControl {
    this._noTransform = true
    return this
  }

  public maxAge(maxAge: number): CacheControl {
    this._maxAge = maxAge
    return this
  }

  public static never(): CacheControl {
    return new CacheControl().noTransform.noStore.noCache
  }

  public static forEver(): CacheControl {
    return new CacheControl().maxAge(31536000)
  }

  public toString(): string {
    const values: string[] = []

    if (this._public) values.push('public')
    if (this._private) values.push('private')
    if (this._mustRevalidate) values.push('must-revalidate')
    if (this._noCache) values.push('no-cache')
    if (this._noStore) values.push('no-store')
    if (this._noTransform) values.push('no-transform')
    if (this._maxAge) values.push(`max-age=${this._maxAge}`)

    return values.join(', ')
  }
}
