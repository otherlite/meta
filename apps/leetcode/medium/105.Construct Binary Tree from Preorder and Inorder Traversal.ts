/*
 * @lc app=leetcode id=105 lang=typescript
 * @lcpr version=30400
 *
 * [105] Construct Binary Tree from Preorder and Inorder Traversal
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
function buildTree(preorder: number[], inorder: number[]): TreeNode | null {
  const inorderMap: Map<number, number> = new Map();
  for (let i = 0; i < inorder.length; i++) {
    inorderMap.set(inorder[i], i);
  }

  const helper = (
    [preI, preJ]: [number, number],
    [inI, inJ]: [number, number],
  ): TreeNode | null => {
    if (preI > preJ) return null;
    const rootVal = preorder[preI];
    const root: TreeNode = { val: rootVal, left: null, right: null };
    const rootIndex = inorderMap.get(rootVal)!;
    root.left = helper(
      [preI + 1, preI + rootIndex - inI],
      [inI, rootIndex - 1],
    );
    root.right = helper(
      [preI + rootIndex - inI + 1, preJ],
      [rootIndex + 1, inJ],
    );
    return root;
  };

  return helper([0, preorder.length - 1], [0, inorder.length - 1]);
}
// @lc code=end

/*
// @lcpr case=start
// [3,9,20,15,7]\n[9,3,15,20,7]\n
// @lcpr case=end

// @lcpr case=start
// [-1]\n[-1]\n
// @lcpr case=end

 */
