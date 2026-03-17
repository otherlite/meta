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
    const subStack = [];
    for (let i = 0; i < stack.length; i++) {
      const el = stack[i];
      ceil.push(el.val);
      el.left && subStack.push(el.left);
      el.right && subStack.push(el.right);
    }
    result.push(ceil);
    stack = subStack;
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
