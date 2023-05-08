import { SignalObjectProxy } from "./signal_object_proxy";
import { SignalArray } from "./signal_array";
import { SignalMap } from "./signal_map";
import { SignalSet } from "./signal_set";

export const isPrimitive = (obj: any) => {
  const type = typeof obj;
  return (
    type === "string" ||
    obj instanceof String ||
    type === "number" ||
    obj instanceof Number ||
    type === "boolean" ||
    obj instanceof Boolean
  );
};

const fastStateMap = new WeakMap<object, any>();

export const getComplexSignal = (obj: any) => {
  if (obj === undefined || obj === null) {
    return obj;
  }
  if (fastStateMap.has(obj as any)) {
    return fastStateMap.get(obj as any);
  }

  if (isPrimitive(obj)) {
    return obj;
  }

  let fastObj;
  if (obj instanceof Array) {
    fastObj = new SignalArray(obj);
  } else if (obj instanceof Map) {
    fastObj = new SignalMap(obj);
  } else if (obj instanceof Set) {
    fastObj = new SignalSet(obj);
  } else if (obj instanceof Object) {
    const proxyHandler = SignalObjectProxy;

    fastObj = new Proxy(obj, proxyHandler);
  } else {
    fastObj = obj;
  }

  fastStateMap.set(obj as any, fastObj);

  return fastObj;
};
