export class MaxHeap<T> {
  private items: T[] = [];

  constructor(private readonly compare: (left: T, right: T) => number) {}

  insert(item: T) {
    this.items.push(item);
    this.bubbleUp(this.items.length - 1);
  }

  peek(): T | undefined {
    return this.items[0];
  }

  remove(): T | undefined {
    if (this.items.length === 0) {
      return undefined;
    }

    if (this.items.length === 1) {
      return this.items.pop();
    }

    const top = this.items[0];
    const lastItem = this.items.pop();

    if (lastItem !== undefined) {
      this.items[0] = lastItem;
      this.bubbleDown(0);
    }

    return top;
  }

  removeBy(predicate: (item: T) => boolean): T | undefined {
    const index = this.items.findIndex(predicate);

    if (index < 0) {
      return undefined;
    }

    const removed = this.items[index];
    const lastItem = this.items.pop();

    if (lastItem !== undefined && index < this.items.length + 1) {
      if (index < this.items.length) {
        this.items[index] = lastItem;
        this.rebalance(index);
      }
    }

    return removed;
  }

  clear() {
    this.items = [];
  }

  size() {
    return this.items.length;
  }

  values(): T[] {
    return [...this.items];
  }

  top(limit = 10): T[] {
    return [...this.items].sort((left, right) => this.compare(right, left)).slice(0, limit);
  }

  private rebalance(index: number) {
    const parentIndex = this.parent(index);
    const currentItem = this.items[index];
    const parentItem = this.items[parentIndex];

    if (!currentItem || !parentItem) {
      return;
    }

    if (index > 0 && this.compare(currentItem, parentItem) > 0) {
      this.bubbleUp(index);
      return;
    }

    this.bubbleDown(index);
  }

  private bubbleUp(index: number) {
    let currentIndex = index;

    while (currentIndex > 0) {
      const parentIndex = this.parent(currentIndex);
      const currentItem = this.items[currentIndex];
      const parentItem = this.items[parentIndex];

      if (!currentItem || !parentItem) {
        break;
      }

      if (this.compare(currentItem, parentItem) <= 0) {
        break;
      }

      this.swap(currentIndex, parentIndex);
      currentIndex = parentIndex;
    }
  }

  private bubbleDown(index: number) {
    let currentIndex = index;

    while (true) {
      const leftChild = this.leftChild(currentIndex);
      const rightChild = this.rightChild(currentIndex);
      let largestIndex = currentIndex;
      const currentItem = this.items[currentIndex];

      if (!currentItem) {
        break;
      }

      if (leftChild < this.items.length) {
        const leftItem = this.items[leftChild];

        if (leftItem && this.compare(leftItem, this.items[largestIndex]!) > 0) {
          largestIndex = leftChild;
        }
      }

      if (rightChild < this.items.length) {
        const rightItem = this.items[rightChild];

        if (rightItem && this.compare(rightItem, this.items[largestIndex]!) > 0) {
          largestIndex = rightChild;
        }
      }

      if (largestIndex === currentIndex) {
        break;
      }

      this.swap(currentIndex, largestIndex);
      currentIndex = largestIndex;
    }
  }

  private swap(leftIndex: number, rightIndex: number) {
    const leftItem = this.items[leftIndex];
    const rightItem = this.items[rightIndex];

    if (leftItem === undefined || rightItem === undefined) {
      return;
    }

    this.items[leftIndex] = rightItem;
    this.items[rightIndex] = leftItem;
  }

  private parent(index: number) {
    return Math.floor((index - 1) / 2);
  }

  private leftChild(index: number) {
    return index * 2 + 1;
  }

  private rightChild(index: number) {
    return index * 2 + 2;
  }
}
