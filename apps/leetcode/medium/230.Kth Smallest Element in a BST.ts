/*
 * @lc app=leetcode id=230 lang=typescript
 * @lcpr version=30400
 *
 * [230] Kth Smallest Element in a BST
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

function kthSmallest(root: TreeNode | null, k: number): number {
  let count = 0;
  let curr = root;
  const stack = [];

  while (curr || stack.length > 0) {
    while (curr) {
      stack.push(curr);
      curr = curr.left!;
    }

    curr = stack.pop()!;
    if (++count === k) {
      return curr.val;
    }

    curr = curr.right!;
  }

  return count;
}
// @lc code=end

/*
// @lcpr case=start
// [3,1,4,null,2]\n1\n
// @lcpr case=end

// @lcpr case=start
// [5,3,6,2,4,null,null,1]\n3\n
// @lcpr case=end

 */
