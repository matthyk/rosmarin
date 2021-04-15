import { Constructor } from '../../types'
import { ControllerMetadata } from './controller-metadata'
import { FullRouteDefinition } from '../../router/route-definitions'

export class RouterMetadataStore {
  private controllers = new Map<Constructor, ControllerMetadata>()
  private routes = new Map<Constructor, FullRouteDefinition[]>()

  public registerController<T>(
    ctor: Constructor<T>,
    metadata: ControllerMetadata
  ): void {
    this.controllers.set(ctor, metadata)
  }

  public getController<T>(
    ctor: Constructor<T>
  ): ControllerMetadata | undefined {
    return this.controllers.get(ctor)
  }

  public addRoute<T>(
    ctor: Constructor<T>,
    routeDefinition: FullRouteDefinition
  ): void {
    if (this.routes.has(ctor) === false) {
      this.routes.set(ctor, [])
    }

    this.routes.get(ctor).push(routeDefinition)
  }

  public getRoutes<T>(ctor: Constructor<T>): FullRouteDefinition[] {
    return this.routes.get(ctor) ?? []
  }

  public clear(): void {
    this.controllers.clear()
    this.routes.clear()
  }
}

export const routerMetadataStore = new RouterMetadataStore()
