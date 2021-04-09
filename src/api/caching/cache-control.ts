/**
 * See https://tools.ietf.org/html/rfc7234#section-5.2
 */
export class CacheControl {
  public public = false
  public private = false
  public mustRevalidate = false
  public noCache = false
  public noStore = false
  public noTransform = false
  private _maxAge = 0
  private _sMaxAge = 0

  public get MaxAge(): number {
    return this._sMaxAge
  }

  public set maxAge(maxAge: number) {
    this._maxAge = maxAge < 0 ? 0 : maxAge
  }

  public get sMaxAge(): number {
    return this._sMaxAge
  }

  public set sMaxAge(sMaxAge: number) {
    this._sMaxAge = sMaxAge < 0 ? 0 : sMaxAge
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

    if (this.public) values.push('public')
    if (this.private) values.push('private')
    if (this.mustRevalidate) values.push('must-revalidate')
    if (this.noCache) values.push('no-cache')
    if (this.noStore) values.push('no-store')
    if (this.noTransform) values.push('no-transform')
    if (this._maxAge) values.push(`max-age=${this._maxAge}`)
    if (this._sMaxAge) values.push(`s-maxage=${this._sMaxAge}`)

    return values.join(', ')
  }
}
