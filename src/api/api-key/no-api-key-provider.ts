import { IApiKeyInfoProvider } from './api-key-info-provider'
import { ApiKeyInfo } from './api-key-info'
import { ApiKeyHeader } from './api-key-header'

export class NoApiKeyProvider implements IApiKeyInfoProvider {
  public async get(_: ApiKeyHeader): Promise<ApiKeyInfo> {
    return new ApiKeyInfo(true)
  }
}
