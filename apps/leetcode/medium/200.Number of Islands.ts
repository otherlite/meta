/*
 * @lc app=leetcode id=200 lang=typescript
 * @lcpr version=30400
 *
 * [200] Number of Islands
 */

// @lc code=start
function numIslands(grid: string[][]): number {
  let m = grid.length;
  let n = grid[0].length;
  let result = 0;

  const dfs = ([x, y]: [number, number]) => {
    // 超出边界 or 已访问 or 碰到水
    if (x < 0 || y < 0 || x === m || y === n || grid[x][y] === "0") return;
    // 已访问改为 "0"
    grid[x][y] = "0";

    // 搜索上下左右
    dfs([x, y + 1]);
    dfs([x, y - 1]);
    dfs([x + 1, y]);
    dfs([x - 1, y]);
  };

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === "1") {
        dfs([i, j]);
        result++;
      }
    }
  }

  return result;
}
// @lc code=end

/*
// @lcpr case=start
// [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]\n
// @lcpr case=end

// @lcpr case=start
// [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]\n
// @lcpr case=end

 */
