/*
 * @lc app=leetcode.cn id=42 lang=typescript
 * @lcpr version=30400
 *
 * [42] 接雨水
 */
// @lc code=start
function trap(height: number[]): number {
  const sink: number[] = [];
  let count = 0;

  for (let i = 0; i < height.length; i++) {
    const rightIndex = i;
    const rightValue = height[rightIndex];
    const lowIndex = sink[sink.length - 1];
    const lowValue = height[lowIndex];

    if (sink.length < 2 || rightValue < lowValue) {
      sink.push(i);
    } else {
      while (sink.length > 0) {
        const leftIndex = sink[sink.length - 2];
        const lowIndex = sink[sink.length - 1];

        const leftValue = height[leftIndex];
        const lowValue = height[lowIndex];

        if (lowValue <= rightValue && lowValue <= leftValue) {
          const width = rightIndex - leftIndex - 1;
          const height = Math.min(leftValue, rightValue) - lowValue;
          count += width * height;
          sink.pop();
        } else {
          sink.push(rightIndex);
          break;
        }
      }
    }
  }

  return count;
}
// @lc code=end

/*
// @lcpr case=start
// [0,1,0,2,1,0,1,3,2,1,2,1]\n
// @lcpr case=end

// @lcpr case=start
// [4,2,0,3,2,5]\n
// @lcpr case=end

 */
