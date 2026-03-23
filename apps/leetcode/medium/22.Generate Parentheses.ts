/*
 * @lc app=leetcode id=22 lang=typescript
 * @lcpr version=30400
 *
 * [22] Generate Parentheses
 */

// @lc code=start
function generateParenthesis(n: number): string[] {
  const result: string[] = [];
  const maxLength = n * 2;
  let path: string[] = [];
  let left = 0;
  let right = 0;

  const bfs = () => {
    if (path.length === maxLength) {
      result.push(path.join(""));
      return;
    }

    if (left < n) {
      path.push("(");
      left++;
      bfs();
      path.pop();
      left--;
    }

    if (left > right && right < n) {
      path.push(")");
      right++;
      bfs();
      path.pop();
      right--;
    }
  };

  bfs();

  return result;
}
// @lc code=end

/*
// @lcpr case=start
// 3\n
// @lcpr case=end

// @lcpr case=start
// 1\n
// @lcpr case=end

 */
