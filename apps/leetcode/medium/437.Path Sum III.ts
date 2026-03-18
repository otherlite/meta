/*
 * @lc app=leetcode id=437 lang=typescript
 * @lcpr version=30400
 *
 * [437] Path Sum III
 */

// @lc code=start
/**
 * Definition for a binary tree node.
 * class TreeNode {
 *     val: number
 *     left: TreeNode | null
 *     right: TreeNode | null
 *     constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.left = (left===undefined ? null : left)
 *         this.right = (right===undefined ? null : right)
 *     }
 * }
 */

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}
function pathSum(root: TreeNode | null, targetSum: number): number {
  if (!root) return 0;

  let result = 0;
  let path = [];

  const helper = (node: TreeNode | null) => {
    if (!node) return null;
    path.push(node);

    let sum = 0;
    for (let i = path.length - 1; i >= 0; i--) {
      sum += path[i].val;
      if (sum === targetSum) {
        result++;
      }
    }

    helper(node.left);
    helper(node.right);

    path.pop();
  };

  helper(root);

  return result;
}
// @lc code=end

/*
// @lcpr case=start
// [10,5,-3,3,2,null,11,3,-2,null,1]\n8\n
// @lcpr case=end

// @lcpr case=start
// [5,4,8,11,null,13,4,7,2,null,null,5,1]\n22\n
// @lcpr case=end

 */
