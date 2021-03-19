// See https://tools.ietf.org/html/rfc7234#section-5.2
export class CacheControl {
  private _public = false
  private _private = false
  private _mustRevalidate = false
  private _noCache = false
  private _noStore = false
  private _noTransform = false
  private _maxAge = 0
  private _sMaxAge = 0

  public get public(): boolean {
    return this._public
  }

  public set public(value: boolean) {
    this._public = value
  }

  public get private(): boolean {
    return this._private
  }

  public set private(value: boolean) {
    this._private = value
  }

  public get mustRevalidate(): boolean {
    return this._mustRevalidate
  }

  public set mustRevalidate(value: boolean) {
    this._mustRevalidate = value
  }

  public get noCache(): boolean {
    return this._noCache
  }

  public set noCache(value: boolean) {
    this._noCache = value
  }

  public get noStore(): boolean {
    return this._noStore
  }

  public set noStore(value: boolean) {
    this._noStore = value
  }

  public get noTransform(): boolean {
    return this._noTransform
  }

  public set noTransform(value: boolean) {
    this._noTransform = value
  }

  public set maxAge(maxAge: number) {
    this._maxAge = maxAge
  }

  public get sMaxAge(): number {
    return this._sMaxAge
  }

  public set sMaxAge(value: number) {
    this._sMaxAge = value
  }

  public static deactivateCaching(): CacheControl {
    const cacheControl: CacheControl = new CacheControl()
    cacheControl.noTransform = true
    cacheControl.noStore = true
    cacheControl.noCache = true
    return cacheControl
  }

  public static cacheForEver(): CacheControl {
    const cacheControl: CacheControl = new CacheControl()
    cacheControl.maxAge = 31536000
    return cacheControl
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
    if (this._sMaxAge) values.push(`s-maxage=${this._sMaxAge}`)

    return values.join(', ')
  }
}
