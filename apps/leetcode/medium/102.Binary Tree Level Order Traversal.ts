/*
 * @lc app=leetcode id=102 lang=typescript
 * @lcpr version=30400
 *
 * [102] Binary Tree Level Order Traversal
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
function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];
  const result = [];
  let stack = [root];

  while (stack.length > 0) {
    const ceil: number[] = [];
    let length = stack.length;
    while (length > 0) {
      const el = stack.shift()!;
      ceil.push(el.val);
      el.left && stack.push(el.left);
      el.right && stack.push(el.right);
      length--;
    }
    result.push(ceil);
  }

  return result;
}
// @lc code=end

/*
// @lcpr case=start
// [3,9,20,null,null,15,7]\n
// @lcpr case=end

// @lcpr case=start
// [1]\n
// @lcpr case=end

// @lcpr case=start
// []\n
// @lcpr case=end

 */
