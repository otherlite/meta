/*
 * @lc app=leetcode id=113 lang=typescript
 * @lcpr version=30400
 *
 * [113] Path Sum II
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
function pathSum2(root: TreeNode | null, targetSum: number): number[][] {
  if (!root) return [];
  const result: number[][] = [];
  const path: number[] = [];
  const helper = (node: TreeNode | null, targetSum: number) => {
    if (!node) return;
    if (!node.left && !node.right && targetSum === node.val) {
      result.push([...path, node.val]);
      return;
    }
    path.push(node.val);
    helper(node.left, targetSum - node.val);
    helper(node.right, targetSum - node.val);
    path.pop();
  };

  helper(root, targetSum);
  return result;
}
// @lc code=end

/*
// @lcpr case=start
// [5,4,8,11,null,13,4,7,2,null,null,5,1]\n22\n
// @lcpr case=end

// @lcpr case=start
// [1,2,3]\n5\n
// @lcpr case=end

// @lcpr case=start
// [1,2]\n0\n
// @lcpr case=end

 */
