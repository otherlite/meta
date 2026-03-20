/*
 * @lc app=leetcode id=40 lang=typescript
 * @lcpr version=30400
 *
 * [40] Combination Sum II
 */
// [10,1,2,7,6,1,5] 8
// @lc code=start
function combinationSum2(candidates: number[], target: number): number[][] {
  const result: number[][] = [];
  const sortedCandidates = candidates.sort((a, b) => a - b);
  const path: number[] = [];
  const used = Array.from({ length: sortedCandidates.length });
  let count = 0;

  const backtrack = (start: number) => {
    if (count === target) {
      result.push([...path]);
      return;
    }
    if (count > target) return;
    const valueUsed = new Map();
    for (let i = start; i < sortedCandidates.length; i++) {
      if (valueUsed.get(sortedCandidates[i])) continue;
      if (used[i]) continue;
      path.push(sortedCandidates[i]);
      count += sortedCandidates[i];
      valueUsed.set(sortedCandidates[i], true);
      used[i] = true;
      backtrack(i);
      path.pop();
      count -= sortedCandidates[i];
      used[i] = false;
    }
  };

  backtrack(0);
  return result;
}
// @lc code=end

/*
// @lcpr case=start
// [10,1,2,7,6,1,5]\n8\n
// @lcpr case=end

// @lcpr case=start
// [2,5,2,1,2]\n5\n
// @lcpr case=end

 */
