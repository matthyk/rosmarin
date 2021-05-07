# ApiKeyInfoProvider

In Rosmarin, the `ApiKeyInfoProvider` is the central class where the check takes place whether a request contains a 
valid API key. The class responsible for this should be registered with the method `registerApiKeyInfoProvider` in 
the `RestApplication`.

```typescript
const app: RestApplication = new RestApplication()

app.registerApiKeyInfoProvider(MyApiKeyInfoProvider)
```

The class `MyApiKeyInfoProvider` must implement the interface 
[`IApiKeyInfoProvider`](src/api/api-key/api-key-info-provider.ts) and be annotated with the `@ApiKeyInfoProvider`
decorator.

```typescript
import { IApiKeyInfoProvider } from "./api-key-info-provider";

@ApiKeyInfoProvider()
class MyApiKeyInfoProvider implements IApiKeyInfoProvider {
  public async get(apiKeyHeader: ApiKeyHeader): Promise<ApiKeyInfo> {
    // access the header with the name 'x-api-key'
    const isValid: boolean = apiKeyHeader.getApiKey('x-api-key') === 's3cr3t'
    
    return new ApiKeyInfo(isValid)
  }
}
```
