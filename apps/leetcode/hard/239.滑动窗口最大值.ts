/*
 * @lc app=leetcode.cn id=239 lang=typescript
 * @lcpr version=30400
 *
 * [239] 滑动窗口最大值
 */
// [1,3,-1,-3,5,3,6,7] 3
// @lc code=start
function maxSlidingWindow(nums: number[], k: number): number[] {
  if (k === 1) return nums;
  const result = [];
  const maxQueue: number[] = [];
  for (let i = 0; i < nums.length; i++) {
    while (maxQueue.length && maxQueue[maxQueue.length - 1] < nums[i]) {
      maxQueue.pop();
    }
    maxQueue.push(nums[i]);

    if (i >= k - 1 && maxQueue[0] === nums[i - k]) {
      maxQueue.shift();
    }

    result.push(maxQueue[0]);
  }

  return nums.length < k ? [result.pop()!] : result.splice(k - 1);
}
// @lc code=end

/*
// @lcpr case=start
// [1,3,-1,-3,5,3,6,7]\n3\n
// @lcpr case=end

// @lcpr case=start
// [1]\n1\n
// @lcpr case=end

 */
