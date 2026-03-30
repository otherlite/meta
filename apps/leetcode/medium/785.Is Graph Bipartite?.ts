/*
 * @lc app=leetcode id=785 lang=typescript
 * @lcpr version=30400
 *
 * [785] Is Graph Bipartite?
 */

// @lc code=start
function isBipartite(graph: number[][]): boolean {
  const arr = Array.from({ length: graph.length }, () => 0);

  const dfs = (i: number, direction: number) => {
    arr[i] = direction;
    for (let index of graph[i]) {
      if (
        arr[index] === direction ||
        (arr[index] === 0 && !dfs(index, -direction))
      )
        return false;
    }
    return true;
  };

  for (let i = 0; i < graph.length; i++) {
    if (arr[i] === 0 && !dfs(i, 1)) {
      return false;
    }
  }

  return true;
}
// @lc code=end

/*
// @lcpr case=start
// [[1,2,3],[0,2],[0,1,3],[0,2]]\n
// @lcpr case=end

// @lcpr case=start
// [[1,3],[0,2],[1,3],[0,2]]\n
// @lcpr case=end

 */
