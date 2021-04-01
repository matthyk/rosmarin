import { autoInjectable } from 'tsyringe'

export const State = (): ReturnType<typeof autoInjectable> => autoInjectable()
