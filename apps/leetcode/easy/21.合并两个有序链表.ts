/*
 * @lc app=leetcode.cn id=21 lang=typescript
 * @lcpr version=30307
 *
 * [21] 合并两个有序链表
 */

// @lc code=start
/**
 * Definition for singly-linked list.
 * class ListNode {
 *     val: number
 *     next: ListNode | null
 *     constructor(val?: number, next?: ListNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.next = (next===undefined ? null : next)
 *     }
 * }
 */

interface ListNode {
  val: number;
  next: ListNode | null;
}
function mergeTwoLists(
  list1: ListNode | null,
  list2: ListNode | null,
): ListNode | null {
  if (!list1 || !list2) return list1 || list2;

  const [leftNode, rightNode] =
    list1.val < list2.val ? [list1, list2] : [list2, list1];

  const leftList = leftNode.next;

  leftNode.next = mergeTwoLists(leftList, rightNode);

  return leftNode;
}
// @lc code=end

/*
// @lcpr case=start
// [1,2,4]\n[1,3,4]\n
// @lcpr case=end

// @lcpr case=start
// []\n[]\n
// @lcpr case=end

// @lcpr case=start
// []\n[0]\n
// @lcpr case=end

 */
