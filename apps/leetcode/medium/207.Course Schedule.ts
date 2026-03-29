/*
 * @lc app=leetcode id=207 lang=typescript
 * @lcpr version=30400
 *
 * [207] Course Schedule
 */

// @lc code=start
function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  const graph: number[][] = Array.from({ length: numCourses }, () => []);
  for (let i = 0; i < prerequisites.length; i++) {
    const [a, b] = prerequisites[i];
    graph[b].push(a);
  }

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
    return true;
  };

  for (let i = 0; i < numCourses; i++) {
    if (!dfs(i)) return false;
  }

  return true;
}
// @lc code=end

/*
// @lcpr case=start
// 2\n[[1,0]]\n
// @lcpr case=end

// @lcpr case=start
// 2\n[[1,0],[0,1]]\n
// @lcpr case=end

 */
