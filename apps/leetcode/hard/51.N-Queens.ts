/*
 * @lc app=leetcode id=51 lang=typescript
 * @lcpr version=30400
 *
 * [51] N-Queens
 */

// @lc code=start
function solveNQueens(n: number): string[][] {
  const result: string[][] = [];
  const path: number[] = [];

  let x = 0;

  const dfs = () => {
    if (path.length === n) {
      result.push(
        path.map((i) => {
          const strArr = Array.from({ length: n });
          strArr[i] = "Q";
          return strArr.join(".");
        }),
      );
      return;
    }

    for (let y = 0; y < n; y++) {
      let match = true;
      for (let k = 0; k < path.length; k++) {
        if (path[k] === y || Math.abs(k - x) === Math.abs(path[k] - y)) {
          match = false;
          break;
        }
      }
      if (match) {
        path.push(y);
        x++;

        dfs();
        path.pop();
        x--;
      } else {
        continue;
      }
    }
  };

  dfs();

  return result;
}
// @lc code=end

/*
// @lcpr case=start
// 4\n
// @lcpr case=end

// @lcpr case=start
// 1\n
// @lcpr case=end

 */
