import { ApiKeyInfoProvider } from './api-key-info-provider'
import { ApiKeyInfo } from './api-key-info'
import { ApiKeyHeader } from './api-key-header'

export class NoApiKeyProvider implements ApiKeyInfoProvider {
  public async get(_apiKeyHeader: ApiKeyHeader): Promise<ApiKeyInfo> {
    return new ApiKeyInfo(true)
  }
}
