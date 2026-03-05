/*
 * @lc app=leetcode.cn id=146 lang=typescript
 * @lcpr version=30307
 *
 * [146] LRU 缓存
 */

interface DoubleListNode {
  key?: number;
  value?: number;
  prev: DoubleListNode | null;
  next: DoubleListNode | null;
}

// @lc code=start
class LRUCache {
  private capacity: number;
  private map = new Map<number, DoubleListNode>();
  private dummyHead: DoubleListNode = { prev: null, next: null };
  private dummyTail: DoubleListNode = { prev: null, next: null };
  private count: number = 0;
  constructor(capacity: number) {
    this.capacity = capacity;
    this.dummyHead.next = this.dummyTail;
    this.dummyTail.prev = this.dummyHead;
  }

  removeNode(doubleListNode: DoubleListNode) {
    let temp1 = doubleListNode.prev;
    let temp2 = doubleListNode.next;
    temp1!.next = temp2;
    temp2!.prev = temp1;
  }

  addToHead(doubleListNode: DoubleListNode) {
    const dummyHead = this.dummyHead;
    const nextNode = this.dummyHead.next!;
    dummyHead.next = doubleListNode;
    doubleListNode.prev = dummyHead;
    doubleListNode.next = nextNode;
    nextNode.prev = doubleListNode;
  }

  moveNodeToHead(doubleListNode: DoubleListNode) {
    this.removeNode(doubleListNode);
    this.addToHead(doubleListNode);
  }
  checkCapacity() {
    if (this.count <= this.capacity) return;
    this.removeNode(this.dummyTail.prev!);
    this.count--;
  }

  get(key: number): number {
    let doubleListNode = this.map.get(key);
    if (!doubleListNode) return -1;
    this.moveNodeToHead(doubleListNode);
    return doubleListNode.value!;
  }

  put(key: number, value: number): void {
    let doubleListNode = this.map.get(key);
    if (!doubleListNode) {
      doubleListNode = { key, value, prev: null, next: null };
      this.map.set(key, doubleListNode);
      this.count++;
      this.addToHead(doubleListNode);
      this.checkCapacity();
    } else {
      doubleListNode.value = value;
      this.moveNodeToHead(doubleListNode);
    }
  }
}

/**
 * Your LRUCache object will be instantiated and called as such:
 * var obj = new LRUCache(capacity)
 * var param_1 = obj.get(key)
 * obj.put(key,value)
 */
// @lc code=end

/*
// @lcpr case=start
// ["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]\n
// @lcpr case=end

 */
