/*
 * @lc app=leetcode.cn id=155 lang=typescript
 * @lcpr version=30307
 *
 * [155] 最小栈
 */

// @lc code=start
class MinStack {
  private arr: number[] = [];
  private min: number = 0;
  constructor() {}

  push(val: number): void {
    if (this.arr.length === 0) {
      this.arr.push(0);
      this.min = val;
    } else {
      const diff = val - this.min;
      this.arr.push(diff);
      this.min = diff < 0 ? val : this.min;
    }
  }

  pop(): void {
    const top = this.arr.pop()!;
    if (top < 0) {
      this.min = this.min - top;
    }
  }

  top(): number {
    const top = this.arr[this.arr.length - 1];
    return top < 0 ? this.min : top + this.min;
  }

  getMin(): number {
    return this.min;
  }
}

/**
 * Your MinStack object will be instantiated and called as such:
 * var obj = new MinStack()
 * obj.push(val)
 * obj.pop()
 * var param_3 = obj.top()
 * var param_4 = obj.getMin()
 */
// @lc code=end

/*
// @lcpr case=start
// ["MinStack","push","push","push","getMin","pop","top","getMin"]\n[[],[-2],[0],[-3],[],[],[],[]]\n
// @lcpr case=end

 */
