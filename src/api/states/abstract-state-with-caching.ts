import { AbstractState } from './abstract-state'
import {
  CacheControl,
  CacheControlConfiguration,
  CachingType,
  createEtag,
} from '../caching'
import { AbstractModel } from '../../models'

export abstract class AbstractStateWithCaching extends AbstractState {
  protected cachingType: CachingType

  protected cacheControlConfigurationSet: Set<CacheControlConfiguration>

  private _maxAgeInSeconds = 0

  private _sMaxAgeInSeconds = 0

  protected modelForCaching: AbstractModel

  protected get maxAgeInSeconds(): number {
    return this._maxAgeInSeconds
  }

  protected set maxAgeInSeconds(value: number) {
    this._maxAgeInSeconds = value < 0 ? 0 : value
  }

  protected get sMaxAgeInSeconds(): number {
    return this._sMaxAgeInSeconds
  }

  protected set sMaxAgeInSeconds(value: number) {
    this._sMaxAgeInSeconds = value < 0 ? 0 : value
  }

  protected constructor() {
    super()
    this.cachingType = CachingType.DEACTIVATE_CACHE
    this.cacheControlConfigurationSet = new Set([
      CacheControlConfiguration.NO_CACHE,
      CacheControlConfiguration.NO_STORE,
    ])
  }

  protected defineModelForCaching(model: AbstractModel): void {
    this.modelForCaching = model
  }

  protected setHttpCachingType(
    cachingType: CachingType,
    ...cacheControlConfigurations: CacheControlConfiguration[]
  ): void {
    this.cachingType = cachingType

    if (cacheControlConfigurations?.length > 0) {
      this.cacheControlConfigurationSet = new Set<CacheControlConfiguration>(
        cacheControlConfigurations
      )
    } else {
      this.cacheControlConfigurationSet = new Set<CacheControlConfiguration>() // TODO
    }
  }

  protected defineHttpCaching(): void {
    switch (this.cachingType) {
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
      cacheControl.maxAge = this._maxAgeInSeconds

      if (!this.isCachePrivate()) {
        cacheControl.sMaxAge = this._sMaxAgeInSeconds
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
    this.response.lastModified(new Date(this.modelForCaching.lastModifiedAt))
  }

  protected defineHttpCachingByEtag(): void {
    this.response.etag(this.createEntityTagOfResult())
  }

  protected createEntityTagOfResult(): string
  protected createEntityTagOfResult(model: AbstractModel): string
  protected createEntityTagOfResult(model?: AbstractModel): string {
    return this.createEtag(model ?? this.modelForCaching)
  }

  /**
   * Override this method to create etag in another way
   */
  protected createEtag(model?: AbstractModel): string {
    return createEtag(model ?? this.modelForCaching)
  }
}
