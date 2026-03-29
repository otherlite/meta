/*
 * @lc app=leetcode id=743 lang=typescript
 * @lcpr version=30400
 *
 * [743] Network Delay Time
 */

// @lc code=start
function networkDelayTime(times: number[][], n: number, k: number): number {
  const graph: number[][][] = Array.from({ length: n + 1 }, () => []);
  for (let i = 0; i < times.length; i++) {
    const [u, v, w] = times[i];
    graph[u].push([v, w]);
  }

  const dist: number[] = Array.from({ length: n + 1 }, () => Infinity);

  const dfs = (i: number, w: number) => {
    if (w >= dist[i]) return;
    dist[i] = w;

    for (let [v, wn] of graph[i]) {
      dfs(v, w + wn);
    }
  };

  dfs(k, 0);

  let res = 0;
  for (let i = 1; i <= n; i++) {
    if (dist[i] === Infinity) return -1;
    res = Math.max(res, dist[i]);
  }

  return res;
}
// @lc code=end

/*
// @lcpr case=start
// [[2,1,1],[2,3,1],[3,4,1]]\n4\n2\n
// @lcpr case=end

// @lcpr case=start
// [[1,2,1]]\n2\n1\n
// @lcpr case=end

// @lcpr case=start
// [[1,2,1]]\n2\n2\n
// @lcpr case=end

 */
