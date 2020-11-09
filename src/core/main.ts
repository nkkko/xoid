import { BaseClass } from './baseStore'
import { error } from './error'
import { Store, GetStoreState, Abstract, Model } from './types'
import {
  destroy,
  getValueByAddress,
  memberMap,
  parentMap,
  setValueByAddress,
  storeMap,
} from './utils'

export const get = <T extends Abstract<any>>(item: T): GetStoreState<T> => {
  const record = storeMap.get(item) || memberMap.get(item)
  if (record) {
    const { address, internal } = record
    if (address.length) {
      return address.reduce(
        (acc: any, key: any) => acc[key],
        internal.getNormalizedState()
      )
    } else {
      return internal.getNormalizedState()
    }
  } else {
    throw error('get')
  }
}
export function set<T extends Model<any, any, any>>(
  store: T,
  value:
    | (T extends Model<any, any, infer B> ? B : never)
    | ((state: GetStoreState<T>) => GetStoreState<T>)
): void
export function set<T extends Abstract<any>>(
  store: T,
  value: GetStoreState<T> | ((state: GetStoreState<T>) => GetStoreState<T>)
): void
export function set<T extends Abstract<any>>(
  store: T,
  value: GetStoreState<T> | ((state: GetStoreState<T>) => GetStoreState<T>)
): void {
  const record = storeMap.get(store) || memberMap.get(store)
  if (record) {
    const { address, internal } = record
    const normalizedState = internal.get()
    const rawValue = getValueByAddress(normalizedState, address)
    const newValue =
      typeof value === 'function' ? (value as Function)(rawValue) : value
    if (newValue !== rawValue) {
      if (address.length) {
        const newState = { ...normalizedState }
        setValueByAddress(newState, address, newValue)
        internal.setInner(newState)
      } else {
        console.log(newValue)
        internal.set(newValue)
      }
    }
  } else throw error('set')
}

export const use = <T, A>(item: Store<T, A>): A => {
  const record = storeMap.get(item)
  if (record) return record.internal.getActions()
  else throw error('use')
}

export const subscribe = <T extends Abstract<any>>(
  item: T,
  fn: (state: GetStoreState<T>) => void
) => {
  const record = storeMap.get(item) || memberMap.get(item)
  if (record) {
    const { address, internal } = record
    if (address.length) {
      // create on-demand store
      const selector = new BaseClass((get) => get(item))
      const unsub = selector.subscribe(fn)
      return () => {
        unsub()
        selector.destroy()
      }
    } else {
      return internal.subscribe(fn as any)
    }
  } else throw error('subscribe')
}

export const parent = <T extends Store<any>>(item: T): Store<any> => {
  const record = parentMap.get(item as object)
  if (record) return record.parent
}