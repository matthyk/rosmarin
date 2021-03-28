import { AbstractState } from './abstract-state'
import { CachingType } from '../caching/caching-type'
import { AbstractModel } from '../abstract-model'
import { CacheControlConfiguration } from '../caching/cache-control-configuration'
import { CacheControl } from '../../routing'
import { createEtag } from '../caching/etag-generator'

export abstract class AbstractStateWithCaching extends AbstractState {
  protected _cachingType: CachingType

  protected cacheControlConfigurationSet: Set<CacheControlConfiguration>

  protected _maxAgeInSeconds = 0

  protected _sMaxAgeInSeconds = 0

  protected _modelForCaching: AbstractModel

  protected constructor() {
    super()
    this._cachingType = CachingType.DEACTIVATE_CACHE
    this.cacheControlConfigurationSet = new Set([
      CacheControlConfiguration.NO_CACHE,
      CacheControlConfiguration.NO_STORE,
    ])
  }

  public get cachingType(): CachingType {
    return this._cachingType
  }

  public set cachingType(value: CachingType) {
    this._cachingType = value
  }

  protected get maxAgeInSeconds(): number {
    return this._maxAgeInSeconds
  }

  protected set maxAgeInSeconds(value: number) {
    this._maxAgeInSeconds = value
  }

  protected get sMaxAgeInSeconds(): number {
    return this._sMaxAgeInSeconds
  }

  protected set sMaxAgeInSeconds(value: number) {
    this._sMaxAgeInSeconds = value
  }

  public get modelForCaching(): AbstractModel {
    return this._modelForCaching
  }

  public set modelForCaching(value: AbstractModel) {
    this._modelForCaching = value
  }

  protected defineModelForCaching(model: AbstractModel): void {
    this._modelForCaching = model
  }

  protected setHttpCachingType(
    cachingType: CachingType,
    ...cacheControlConfigurations: CacheControlConfiguration[]
  ): void {
    this._cachingType = cachingType

    if (cacheControlConfigurations?.length > 0) {
      this.cacheControlConfigurationSet = new Set<CacheControlConfiguration>(
        cacheControlConfigurations
      )
    }
  }

  protected defineHttpCaching(): void {
    switch (this._cachingType) {
      case CachingType.DEACTIVATE_CACHE: {
        this.defineHttpCachingByDeactivatingCache()
        break
      }
      case CachingType.EXPIRES_TIME: {
        this.defineHttpCacheControl()
        break
      }
      case CachingType.VALIDATION_ETAG: {
        this.defineHttpCacheControl()
        this.defineHttpCachingByEtag()
        break
      }
      case CachingType.VALIDATION_TIMESTAMP: {
        this.defineHttpCacheControl()
        this.defineHttpCachingByValidationTimeStamp()
        break
      }
    }
  }

  private defineHttpCachingByDeactivatingCache(): void {
    this.response.cacheControl(CacheControl.deactivateCaching())
  }

  private defineHttpCacheControl(): void {
    const cacheControl: CacheControl = new CacheControl()

    if (!this.isCacheNoCache() && !this.isCacheNoStore()) {
      cacheControl.maxAge = this.maxAgeInSeconds

      if (!this.isCachePrivate()) {
        cacheControl.sMaxAge = this.sMaxAgeInSeconds
      }
    }

    cacheControl.private = this.isCachePrivate()
    cacheControl.noStore = this.isCacheNoStore()
    cacheControl.noCache = this.isCacheNoCache()
    cacheControl.mustRevalidate = this.isCacheMustRevalidate()

    this.response.cacheControl(cacheControl)
  }

  private isCachePrivate(): boolean {
    return this.cacheControlConfigurationSet.has(
      CacheControlConfiguration.PRIVATE
    )
  }

  private isCacheNoStore(): boolean {
    return this.cacheControlConfigurationSet.has(
      CacheControlConfiguration.NO_STORE
    )
  }

  private isCacheMustRevalidate(): boolean {
    return this.cacheControlConfigurationSet.has(
      CacheControlConfiguration.MUST_REVALIDATE
    )
  }

  private isCacheNoCache(): boolean {
    return this.cacheControlConfigurationSet.has(
      CacheControlConfiguration.NO_CACHE
    )
  }

  protected defineHttpCachingByValidationTimeStamp(): void {
    this.response.lastModified(new Date(this._modelForCaching.lastModifiedAt))
  }

  protected defineHttpCachingByEtag(): void {
    this.response.etag(this.createEntityTagOfResult())
  }

  protected createEntityTagOfResult(): string
  protected createEntityTagOfResult(model: AbstractModel): string
  protected createEntityTagOfResult(model?: AbstractModel): string {
    return createEtag(model ?? this._modelForCaching)
  }
}
