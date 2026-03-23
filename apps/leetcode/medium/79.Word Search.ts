/*
 * @lc app=leetcode id=79 lang=typescript
 * @lcpr version=30400
 *
 * [79] Word Search
 */

// @lc code=start
function exist(board: string[][], word: string): boolean {
  let m = board.length;
  let n = board[0].length;

  const dfs = ([x, y]: [number, number], index: number): boolean => {
    // 超出边界 or 已访问 or 不匹配字符
    if (x < 0 || y < 0 || x === m || y === n || board[x][y] !== word[index])
      return false;

    if (index === word.length - 1) return true;

    const temp = board[x][y];
    // 标记已访问
    board[x][y] = "";

    const result =
      dfs([x, y + 1], index + 1) ||
      dfs([x, y - 1], index + 1) ||
      dfs([x + 1, y], index + 1) ||
      dfs([x - 1, y], index + 1);

    // 撤销已访问
    board[x][y] = temp;

    return result;
  };

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (dfs([i, j], 0)) return true;
    }
  }

  return false;
}
// @lc code=end

/*
// @lcpr case=start
// [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\n"ABCCED"\n
// @lcpr case=end

// @lcpr case=start
// [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\n"SEE"\n
// @lcpr case=end

// @lcpr case=start
// [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\n"ABCB"\n
// @lcpr case=end

 */
