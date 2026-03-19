/*
 * @lc app=leetcode id=297 lang=typescript
 * @lcpr version=30400
 *
 * [297] Serialize and Deserialize Binary Tree
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
/*
 * Encodes a tree to a single string.
 */
function serialize(root: TreeNode | null): string {
  if (!root) return "";

  const result: Array<number | string> = [];
  const queue: Array<TreeNode | null> = [root];

  while (queue.length > 0) {
    const item = queue.shift();
    result.push(item?.val ?? "");
    if (item) {
      const left = item.left;
      const right = item.right;
      queue.push(left);
      queue.push(right);
    }
  }

  return result.join("_");
}

/*
 * Decodes your encoded data to tree.
 */
function deserialize(data: string): TreeNode | null {
  if (!data) return null;
  const arr = data.split("_");
  const root: TreeNode = { val: Number(arr.shift()), left: null, right: null };
  const queue: Array<TreeNode> = [root];

  while (queue.length > 0) {
    const node = queue.shift()!;
    const leftVal = arr.shift();
    const rightVal = arr.shift();
    const leftNode = leftVal
      ? { val: Number(leftVal), left: null, right: null }
      : null;
    const rightNode = rightVal
      ? { val: Number(rightVal), left: null, right: null }
      : null;
    node.left = leftNode;
    node.right = rightNode;
    leftNode && queue.push(leftNode);
    rightNode && queue.push(rightNode);
  }

  return root;
}

/**
 * Your functions will be called as such:
 * deserialize(serialize(root));
 */
// @lc code=end

/*
// @lcpr case=start
// [1,2,3,null,null,4,5]\n
// @lcpr case=end

// @lcpr case=start
// []\n
// @lcpr case=end

 */
