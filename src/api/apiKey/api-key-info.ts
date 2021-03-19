// Use a class instead of an interface to provide the possibility of inheritance
export class ApiKeyInfo {
  constructor(protected valid: boolean) {}

  public isValid(): boolean {
    return this.valid
  }
}
