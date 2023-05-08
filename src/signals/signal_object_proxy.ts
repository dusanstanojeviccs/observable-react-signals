import { notifyAll, observe } from "../observability";
import { getComplexSignal, isPrimitive } from "./";

export const SignalObjectProxy = {
  get<T extends object, P extends PropertyKey>(
    target: T,
    propertyKey: P,
    receiver?: unknown,
  ): P extends keyof T ? T[P] : any {
    // we need to bind a function to the target

    const field = Reflect.get(target, propertyKey, receiver);
    if (field instanceof Function) {
      return field.bind(receiver);
    }

    observe(target, propertyKey);

    if (!isPrimitive(field)) {
      return getComplexSignal(field as object) as any;
    }

    return field;
  },
  set<T extends object, P extends PropertyKey>(
    target: T,
    propertyKey: P,
    value: P extends keyof T ? T[P] : any,
    receiver?: any,
  ) {
    Reflect.set(target, propertyKey, value, receiver);

    notifyAll(target, propertyKey);

    return true;
  },
};
