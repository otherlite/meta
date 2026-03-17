/*
 * @lc app=leetcode id=54 lang=typescript
 * @lcpr version=30400
 *
 * [54] Spiral Matrix
 */

// @lc code=start
function spiralOrder(matrix: number[][]): number[] {
  if (matrix.length === 0 || matrix[0].length === 0) return [];

  const result: number[] = [];

  // top
  const top = matrix.shift();
  while (top && top.length > 0) {
    const el = top.shift();
    el !== undefined && result.push(el);
  }

  // right
  for (let i = 0; i < matrix.length; i++) {
    const el = matrix[i].pop();
    el !== undefined && result.push(el);
  }

  // bottom
  const bottom = matrix.pop();
  while (bottom && bottom.length > 0) {
    const el = bottom.pop();
    el !== undefined && result.push(el);
  }

  // left
  for (let i = matrix.length - 1; i >= 0; i--) {
    const el = matrix[i].shift();
    el !== undefined && result.push(el);
  }

  return result.concat(spiralOrder(matrix));
}
// @lc code=end

/*
// @lcpr case=start
// [[1,2,3],[4,5,6],[7,8,9]]\n
// @lcpr case=end

// @lcpr case=start
// [[1,2,3,4],[5,6,7,8],[9,10,11,12]]\n
// @lcpr case=end

 */
