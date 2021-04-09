import { ApiKeyHeader } from './api-key-header'
import { ApiKeyInfo } from './api-key-info'

export interface IApiKeyInfoProvider {
  get(apiKeyHeader: ApiKeyHeader): Promise<ApiKeyInfo>
}
