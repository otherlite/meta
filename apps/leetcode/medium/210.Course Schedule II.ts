/*
 * @lc app=leetcode id=210 lang=typescript
 * @lcpr version=30400
 *
 * [210] Course Schedule II
 */

// @lc code=start
function findOrder(numCourses: number, prerequisites: number[][]): number[] {
  const graph: number[][] = Array.from({ length: numCourses }, () => []);
  for (let i = 0; i < prerequisites.length; i++) {
    const [a, b] = prerequisites[i];
    graph[b].push(a);
  }

  const result: number[] = [];
  const visited: number[] = Array.from({ length: numCourses }, () => 0);

  const dfs = (i: number) => {
    if (visited[i] === 1) return false;
    if (visited[i] === 2) return true;

    const nextArr = graph[i];
    visited[i] = 1;
    for (let i = 0; i < nextArr.length; i++) {
      if (!dfs(nextArr[i])) return false;
    }
    visited[i] = 2;
    result.push(i);
    return true;
  };

  for (let i = 0; i < numCourses; i++) {
    if (!dfs(i)) return [];
  }

  return result.reverse();
}
// @lc code=end

/*
// @lcpr case=start
// 2\n[[1,0]]\n
// @lcpr case=end

// @lcpr case=start
// 4\n[[1,0],[2,0],[3,1],[3,2]]\n
// @lcpr case=end

// @lcpr case=start
// 1\n[]\n
// @lcpr case=end

 */
