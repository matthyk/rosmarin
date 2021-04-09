import {
  AbstractModel,
  convertLinks,
  link,
  Link,
  ModelId,
  modelProp,
} from '../../../src'

describe('convertLinks', () => {
  class SimpleModel extends AbstractModel {
    constructor(id: ModelId) {
      super()
      this.id = id
    }

    @link('models/{id}', 'self', 'application/json')
    self: Link
  }

  it('should convert link in simple object', () => {
    const model = new SimpleModel(2)

    const result = convertLinks(model, 'abc')

    expect(result).toBeDefined()
    expect(result.id).toEqual(2)
    expect(result.self).toEqual({
      href: 'abc/models/2',
      rel: 'self',
      type: 'application/json',
    })
  })

  it('should convert links in nested model', () => {
    class NestedModel extends AbstractModel {
      @link('wows/{id}', 'getWows', 'application/json')
      self: Link
    }

    class Model extends AbstractModel {
      @modelProp()
      nested: NestedModel
    }

    const model = new Model()
    model.nested = new NestedModel()
    model.nested.id = 11

    const result = convertLinks(model, 'http://localhost:8080')

    expect(result).toBeDefined()
    expect(result.nested.id).toEqual(11)
    expect(result.nested.self).toEqual({
      href: 'http://localhost:8080/wows/11',
      rel: 'getWows',
      type: 'application/json',
    })
  })

  it('should convert links in array of models', () => {
    const models: SimpleModel[] = [new SimpleModel(1), new SimpleModel(2)]

    const result = convertLinks(models, 'http://localhost:8080')

    expect(result).toBeDefined()
    expect(result).toHaveLength(2)
    expect(result[0].self).toEqual({
      href: 'http://localhost:8080/models/1',
      rel: 'self',
      type: 'application/json',
    })
    expect(result[1].self).toEqual({
      href: 'http://localhost:8080/models/2',
      rel: 'self',
      type: 'application/json',
    })
  })
})
