/*
 * @lc app=leetcode id=347 lang=typescript
 * @lcpr version=30400
 *
 * [347] Top K Frequent Elements
 */

// @lc code=start
function topKFrequent(nums: number[], k: number): number[] {
  const map: Map<number, number> = new Map();
  for (let num of nums) {
    map.set(num, (map.get(num) ?? 0) + 1);
  }

  if (map.size <= k) return [...map.keys()];

  const arr: number[][] = [];
  const result = [];

  map.forEach((value, key) => {
    if (!arr[value]) arr[value] = [];
    arr[value].push(key);
  });

  for (let i = arr.length - 1; i > 0 && result.length < k; i--) {
    if (arr[i]) {
      result.push(...arr[i]);
    }
  }

  return result.slice(0, k);
}
// @lc code=end

/*
// @lcpr case=start
// [1,1,1,2,2,3]\n2\n
// @lcpr case=end

// @lcpr case=start
// [1]\n1\n
// @lcpr case=end

// @lcpr case=start
// [1,2,1,2,1,2,3,1,3,2]\n2\n
// @lcpr case=end

 */
