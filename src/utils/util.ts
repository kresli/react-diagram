import {
  types,
  IAnyModelType,
  ModelPropertiesDeclaration,
  IModelType,
  Instance,
  unprotect,
  getRoot,
  IAnyStateTreeNode,
  onSnapshot,
  SnapshotOut
} from "mobx-state-tree";
import { ExtractProps } from "mobx-state-tree/dist/internal";
import { computed } from "mobx";

export function Bundle<
  T extends {
    new (...args: any[]): { $model: IAnyStateTreeNode };
    Store: IAnyModelType;
  }
>(Base: T) {
  interface StoreType
    extends IModelType<
      ExtractProps<T["Store"]>,
      { $controller: InstanceType<T> }
    > {}
  const Store = Base.Store.volatile(self => {
    unprotect(getRoot(self));
    const $controller = new Base(self);
    $controller.$model = self;
    return {
      $controller
    };
  }).actions(self => ({
    afterCreate() {
      onSnapshot(self, snap => self.$controller.onSnapshot(snap));
      self.$controller.afterCreate();
    }
  })) as StoreType;
  return class Bundle extends Base {
    static Store = Store;
  };
}

export function Controller<P extends ModelPropertiesDeclaration = any>(
  props: P
) {
  const Store = types.model().props(props);
  return class Controller {
    static Store = Store;
    $model!: Instance<typeof Store>;
    afterCreate() {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSnapshot(snap: SnapshotOut<typeof Store>) {}
  };
}

export const computedAlive = computed({ keepAlive: true });
