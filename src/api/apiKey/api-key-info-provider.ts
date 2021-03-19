import { ApiKeyHeader } from './api-key-header'
import { ApiKeyInfo } from './api-key-info'

export interface ApiKeyInfoProvider {
  get(apiKeyHeader: ApiKeyHeader): Promise<ApiKeyInfo>
}
