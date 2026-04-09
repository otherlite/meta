/*
 * @lc app=leetcode id=39 lang=typescript
 * @lcpr version=30400
 *
 * [39] Combination Sum
 */

// @lc code=start
function combinationSum(candidates: number[], target: number): number[][] {
  if (target < 2) return [];
  const result: number[][] = [];
  const sortedCandidates = candidates.sort((a, b) => a - b);
  const path: number[] = [];
  let sum = 0;
  const backtrack = (start: number) => {
    if (sum === target) {
      result.push([...path]);
      return;
    }
    for (let i = start; i < sortedCandidates.length; i++) {
      if (sum + sortedCandidates[i] > target) break;

      path.push(sortedCandidates[i]);
      sum += sortedCandidates[i];
      backtrack(start);
      path.pop();
      sum -= sortedCandidates[i];
    }
  };

  backtrack(0);

  return result;
}
// @lc code=end

/*
// @lcpr case=start
// [2,3,6,7]\n7\n
// @lcpr case=end

// @lcpr case=start
// [2,3,5]\n8\n
// @lcpr case=end

// @lcpr case=start
// [2]\n1\n
// @lcpr case=end

 */
