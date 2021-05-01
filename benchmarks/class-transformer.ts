import 'reflect-metadata'
import Benchmark from 'benchmark'
import { plainToClass } from 'class-transformer'
import { Constructor } from '../src/types'
import {
  AbstractViewModel,
  isConstructorOfPrimitiveValue,
  viewProp,
} from '../src'
import { viewMetadataStore } from '../src/metadata-stores'

const suite = new Benchmark.Suite()

// very simple prototype that uses the already existing metadata
const customPlainToClass = <T extends AbstractViewModel>(
  ctor: Constructor<T>,
  plain: any
): T => {
  const instance = new ctor() as any

  const viewProps = viewMetadataStore.getProperties(ctor)

  for (const viewProp of viewProps) {
    const type = viewMetadataStore.getPropertyType(ctor, viewProp.name)

    if (isConstructorOfPrimitiveValue(type)) {
      instance[viewProp.name] = plain[viewProp.name]
    } else {
      instance[viewProp.name] = customPlainToClass(
        type as Constructor<AbstractViewModel>,
        plain[viewProp.name]
      )
    }
  }

  return instance
}

class Embedded {
  @viewProp()
  firstProp: number

  @viewProp()
  secondProp: string
}

class View extends AbstractViewModel {
  @viewProp()
  name: string

  @viewProp()
  password: string

  @viewProp()
  embedded: Embedded
}

const plain = {
  name: 'Alan Turing',
  password: 's3cr3t',
  embedded: {
    firstProp: 123,
    secondProp: 'lol',
  },
}

suite
  // ~ 179,860 ops/sec
  .add('transform to class with class-transformer', function () {
    plainToClass(View, plain)
  })
  // ~ 586,926 ops/sec
  .add('transform to class with custom transformer', function () {
    customPlainToClass(View, plain)
  })
  .on('cycle', function (event: Benchmark.Event) {
    console.log(String(event.target))
  })
  .run({ async: true })
