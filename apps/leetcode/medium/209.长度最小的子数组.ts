/*
 * @lc app=leetcode.cn id=209 lang=typescript
 * @lcpr version=30400
 *
 * [209] 长度最小的子数组
 */
// [2,3,1,2,4,3]
// @lc code=start
function minSubArrayLen(target: number, nums: number[]): number {
  let result = 0;
  const queue: number[] = [];
  let count = 0;
  let size = 0;
  let curr = 0;
  while (curr < nums.length) {
    queue.push(curr);
    count += nums[curr];
    size++;

    while (count >= target) {
      // 设置最小数组长度
      result = size < result || result === 0 ? size : result;
      // 删除最小
      const i = queue.shift()!;
      count -= nums[i];
      size--;
    }

    curr++;
  }

  return result;
}
// @lc code=end

/*
// @lcpr case=start
// 7\n[2,3,1,2,4,3]\n
// @lcpr case=end

// @lcpr case=start
// 4\n[1,4,4]\n
// @lcpr case=end

// @lcpr case=start
// 11\n[1,1,1,1,1,1,1,1]\n
// @lcpr case=end

 */
