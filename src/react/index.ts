import { useCallback, useMemo, useState } from "react"
import { Computation, ComputationContext, registerComputationEnd, registerComputationStart } from "../observability"
import { getComplexSignal } from "../signals"

function useComputationState(): ComputationContext {
  const [ref, setRef] = useState(0)
  const getRef = useCallback(() => ref, [ref])
  const state = useMemo(() => {
    return {
      onInvalidate: () => setRef((r) => r + 1),
      getRef,
    }
  }, [setRef, getRef])
  return state
}

export function SignalBoundary<T, M>(component: (props: M) => T): (props: M) => T {
  const InnerComponent = function (props: M): T {
    const state = useComputationState()

    registerComputationStart(state)
    const value: T = component(props)
    registerComputationEnd(state)
    return value
  }
  return InnerComponent
}

export function useSignal<T>(initial: T): T {
  // use fast state is based on a weak map that creates an observable object
  // for each non observable object that the user has
  // the observable object is going through a proxy object that is returned
  // when ever something on the fast object is accessed
  // arrays are wrapped in array proxies
  // objects are wrapped in object proxies
  // every method that potentially mutates an array and returnes a copy
  // also returns a mutable array proxy object
  if (typeof initial === 'function') {
    throw new Error('Functions are not state! Objects and arrays are cool tho')
  }

  return useMemo(() => getComplexSignal(initial as object) as any, [initial])
}

export function useComputation<T>(computation: () => T): T {
  const computationContext = useComputationState()
  const [computationState] = useState(() => new Computation(computation))

  registerComputationStart(computationContext)
  const value = computationState.value
  registerComputationEnd(computationContext)

  return value
}