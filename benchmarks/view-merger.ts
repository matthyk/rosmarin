import 'reflect-metadata'
import Benchmark from 'benchmark'
import {
  AbstractModel,
  AbstractViewModel,
  merge,
  viewProp,
  modelProp,
} from '../src'

const suite = new Benchmark.Suite()

class EmbeddedModel extends AbstractModel {
  test: number
}

class Model extends AbstractModel {
  propA: string

  propB: string

  @modelProp()
  embedded: EmbeddedModel
}

class EmbeddedView extends AbstractViewModel {
  @viewProp()
  test: number
}

class View extends AbstractViewModel {
  @viewProp()
  propA: string

  @viewProp()
  propB: string

  @viewProp()
  embedded: EmbeddedView
}

const model = new Model()
model.propA = 'A'
model.propB = 'B'

const view = new View()
view.propA = 'C'
view.propB = 'D'
view.embedded = new EmbeddedView()
view.embedded.test = 13

const mergeViewWithModel = (view: View, model: Model): Model => {
  model.propA = view.propA
  model.propB = view.propB

  if (typeof model.embedded === 'undefined') {
    model.embedded = new EmbeddedModel()
  }

  model.embedded.test = view.embedded.test

  return model
}

/**
 * A self-written method is significantly faster. But especially for views/models with a lot of properties the merge
 * method saves the developer a lot of development time. In the concrete state implementations, the developer can decide
 * whether to use the merge method or to use a custom method.
 */
suite
  // ~ 17,265 ops/sec
  .add('merge with generic view merger', async function () {
    merge(view, model)
  })
  // ~ 646,372 ops/sec
  .add('merge with custom function', async function () {
    mergeViewWithModel(view, model)
  })
  .on('cycle', function (event: Benchmark.Event) {
    console.log(String(event.target))
  })
  .run({ async: true })
