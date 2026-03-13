/*
 * @lc app=leetcode.cn id=1 lang=typescript
 * @lcpr version=30400
 *
 * [1] 两数之和
 */
// [2,7,11,15]
// @lc code=start
function twoSum(nums: number[], target: number): number[] {
  const map: Record<number, number> = {};
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map[diff] !== undefined) {
      return [map[diff], i];
    } else {
      map[nums[i]] = i;
    }
  }

  return [0, 0];
}
// @lc code=end

/*
// @lcpr case=start
// [2,7,11,15]\n9\n
// @lcpr case=end

// @lcpr case=start
// [3,2,4]\n6\n
// @lcpr case=end

// @lcpr case=start
// [3,3]\n6\n
// @lcpr case=end

 */
