/*
 * @lc app=leetcode id=47 lang=typescript
 * @lcpr version=30400
 *
 * [47] Permutations II
 */

// @lc code=start
function permuteUnique(nums: number[]): number[][] {
  const result: number[][] = [];
  const path: number[] = [];
  const used = Array.from({ length: nums.length });

  const backtrack = () => {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }
    const valueUsed: Map<number, boolean> = new Map();
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      if (valueUsed.get(nums[i])) {
        continue;
      } else {
        valueUsed.set(nums[i], true);
      }
      path.push(nums[i]);
      used[i] = true;
      backtrack();
      path.pop();
      used[i] = false;
    }
  };

  backtrack();

  return result;
}
// @lc code=end

/*
// @lcpr case=start
// [1,1,2]\n
// @lcpr case=end

// @lcpr case=start
// [1,2,3]\n
// @lcpr case=end

 */
