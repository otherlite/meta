/*
 * @lc app=leetcode id=695 lang=typescript
 * @lcpr version=30400
 *
 * [695] Max Area of Island
 */

// @lc code=start
function maxAreaOfIsland(grid: number[][]): number {
  let m = grid.length;
  let n = grid[0].length;
  let result = 0;

  const dfs = ([x, y]: [number, number]): number => {
    // 超出边界 or 已访问 or 碰到水
    if (x < 0 || y < 0 || x === m || y === n || grid[x][y] === 0) return 0;
    // 已访问改为 "0"
    grid[x][y] = 0;

    // 搜索上下左右
    return (
      dfs([x, y + 1]) + dfs([x, y - 1]) + dfs([x + 1, y]) + dfs([x - 1, y]) + 1
    );
  };

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === 1) {
        result = Math.max(result, dfs([i, j]));
      }
    }
  }

  return result;
}
// @lc code=end

/*
// @lcpr case=start
// [[0,0,1,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,1,1,0,1,0,0,0,0,0,0,0,0],[0,1,0,0,1,1,0,0,1,0,1,0,0],[0,1,0,0,1,1,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,0,0,0,0,0,0,1,1,0,0,0,0]]\n
// @lcpr case=end

// @lcpr case=start
// [[0,0,0,0,0,0,0,0]]\n
// @lcpr case=end

 */
