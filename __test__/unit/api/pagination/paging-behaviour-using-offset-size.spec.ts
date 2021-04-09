import { PagingBehaviourUsingOffsetSize } from '../../../../src'

describe('Paginator using Offset and Size', () => {
  const fullUrl = 'http://localhost:8080'
  const type = 'application/json'

  it('Should calculate next page offset and size correctly', () => {
    let paginator = new PagingBehaviourUsingOffsetSize(fullUrl, 4, 0, 2, type)

    expect(paginator['getNextLinkOffset']()).toEqual('2')
    expect(paginator['getNextLinkSize']()).toEqual('2')

    paginator = new PagingBehaviourUsingOffsetSize(fullUrl, 4, 0, 20, type)

    expect(paginator['getNextLinkSize']()).toEqual('10')
  })

  it('Should calculate previous page offset and size correctly', () => {
    const paginator = new PagingBehaviourUsingOffsetSize(
      fullUrl,
      42,
      17,
      9,
      type
    )

    expect(paginator['getPreviousLinkOffset']()).toEqual('8')
    expect(paginator['getPreviousLinkSize']()).toEqual('9')
  })

  it('Should calculate last page offset and size correctly', () => {
    let paginator = new PagingBehaviourUsingOffsetSize(fullUrl, 42, 17, 9, type)

    expect(paginator['getLastLinkOffset']()).toEqual('35')
    expect(paginator['getLastLinkSize']()).toEqual('7')

    paginator = new PagingBehaviourUsingOffsetSize(fullUrl, 42, 23, 9, type)

    expect(paginator['getLastLinkOffset']()).toEqual('41')
    expect(paginator['getLastLinkSize']()).toEqual('1')
  })

  it('Should calculate first page offset and size correctly', () => {
    let paginator = new PagingBehaviourUsingOffsetSize(fullUrl, 42, 17, 9, type)

    expect(paginator['getFirstLinkSize']()).toEqual('8')

    paginator = new PagingBehaviourUsingOffsetSize(fullUrl, 42, 13, 9, type)

    expect(paginator['getFirstLinkSize']()).toEqual('4')
  })
})
