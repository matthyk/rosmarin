import {
  AbstractModel,
  AbstractViewModel,
  merge,
  modelArrayProp,
  modelProp,
  viewArrayProp,
  viewProp,
} from '../../../../src'

describe('view merger', () => {
  class EmbeddedCollectionResourceView extends AbstractViewModel {
    @viewProp()
    lol: string

    @viewProp()
    second: number
  }

  class DeepEmbeddedResourceView extends AbstractViewModel {
    @viewProp()
    prop: string
  }

  class EmbeddedResourceView extends AbstractViewModel {
    @viewProp()
    test: string

    @viewProp()
    property: boolean

    @viewProp()
    deep: DeepEmbeddedResourceView
  }

  class View extends AbstractViewModel {
    @viewProp()
    stringProp: string

    @viewProp()
    numberProp: number

    @viewProp()
    embedded: EmbeddedResourceView

    @viewArrayProp(() => EmbeddedCollectionResourceView)
    collection: EmbeddedCollectionResourceView[]
  }

  class EmbeddedCollectionResourceModel extends AbstractViewModel {
    lol: string

    second: number
  }

  class DeepEmbeddedResourceModel extends AbstractViewModel {
    prop: string
  }

  class EmbeddedResourceModel extends AbstractModel {
    test: string

    property: boolean

    @modelProp()
    deep: DeepEmbeddedResourceModel
  }

  class Model extends AbstractModel {
    stringProp: string

    numberProp: number

    @modelProp()
    embedded: EmbeddedResourceModel

    @modelArrayProp(() => EmbeddedCollectionResourceModel)
    collection: EmbeddedCollectionResourceModel[]
  }

  it('should copy primitive values from view to model', () => {
    const view = new View()
    view.numberProp = 12342534
    view.stringProp = '123425347'

    const model = merge(view, new Model())

    expect(model.numberProp).toEqual(12342534)
    expect(model.stringProp).toEqual('123425347')
  })

  it('should delete primitive value in model if it is unset in view', () => {
    const view = new View()
    view.stringProp = '123425347'

    let model = new Model()
    model.numberProp = 11

    model = merge(view, model)

    expect(model.numberProp).toBeUndefined()
  })

  it('should copy embedded resource', () => {
    const view = new View()
    view.embedded = new EmbeddedResourceView()
    view.embedded.test = 'wow'
    view.embedded.property = true

    let model = new Model()

    model = merge(view, model)

    expect(model.embedded).toBeInstanceOf(EmbeddedResourceModel)
    expect(model.embedded.property).toEqual(true)
    expect(model.embedded.test).toEqual('wow')
  })

  it('should create embedded collection resource in target if it does not exist', () => {
    const view = new View()
    const embeddedCollectionResourceView = new EmbeddedCollectionResourceView()
    embeddedCollectionResourceView.lol = 'lol'
    view.collection = [embeddedCollectionResourceView]

    let model = new Model()

    model = merge(view, model)

    expect(model.collection[0]).toBeDefined()
    expect(model.collection[0]).toBeInstanceOf(EmbeddedCollectionResourceModel)
    expect(model.collection[0].lol).toEqual('lol')
  })

  it('should delete embedded collection resource in target if it does not exist in the source', () => {
    const view = new View()
    view.collection = []

    let model = new Model()
    const embedded = new EmbeddedCollectionResourceModel()
    embedded.lol = 'ok'
    embedded.id = 13
    model.collection = [embedded]

    model = merge(view, model)

    expect(model.collection).toHaveLength(0)
  })

  it('should merge embedded collection resource if it does exist already in target', () => {
    const view = new View()
    const embeddedCollectionResourceView = new EmbeddedCollectionResourceView()
    embeddedCollectionResourceView.lol = 'shouldBeThere'
    embeddedCollectionResourceView.id = 13
    embeddedCollectionResourceView.second = 23
    view.collection = [embeddedCollectionResourceView]

    let model = new Model()
    const embedded = new EmbeddedCollectionResourceModel()
    embedded.lol = 'shouldBeOverridden'
    embedded.id = 13
    embedded.second = 23
    model.collection = [embedded]

    model = merge(view, model)

    expect(model.collection).toHaveLength(1)
    expect(model.collection[0]).toBeInstanceOf(EmbeddedCollectionResourceModel)
    expect(model.collection[0].lol).toEqual('shouldBeThere')
    expect(model.collection[0].id).toEqual(13)
    expect(model.collection[0].second).toEqual(23)
  })

  it('should create deep nested embedded resource in target', () => {
    const view = new View()
    view.embedded = new EmbeddedResourceView()
    view.embedded.test = 'wow'
    view.embedded.property = true
    view.embedded.deep = new DeepEmbeddedResourceView()
    view.embedded.deep.prop = 'hello'

    let model = new Model()

    model = merge(view, model)

    expect(model.embedded.deep).toBeInstanceOf(DeepEmbeddedResourceModel)
    expect(model.embedded.deep.prop).toEqual('hello')
  })

  it('should create array of primitive values in target', () => {
    class SimpleModel extends AbstractModel {
      @modelArrayProp(() => String)
      strings: string[]
    }

    class SimpleView extends AbstractViewModel {
      @viewArrayProp(() => String)
      strings: string[]
    }

    let model = new SimpleModel()

    const view = new SimpleView()
    view.strings = ['test']

    model = merge(view, model)

    expect(model.strings).toEqual(['test'])
  })
})
