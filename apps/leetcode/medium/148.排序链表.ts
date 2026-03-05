/*
 * @lc app=leetcode.cn id=148 lang=typescript
 * @lcpr version=30307
 *
 * [148] 排序链表
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

function getMid(head: ListNode): ListNode {
  // slow 停在左半部分末尾（对于偶数节点，左半部分稍长）
  let slow: ListNode = head;
  let fast: ListNode | null = head.next;
  while (fast && fast.next) {
    slow = slow.next as ListNode;
    fast = fast.next.next;
  }
  return slow;
}

function merge(a: ListNode | null, b: ListNode | null): ListNode | null {
  const dummy: ListNode = { val: 0, next: null };
  let tail = dummy;
  while (a && b) {
    if (a.val <= b.val) {
      tail.next = a;
      a = a.next;
    } else {
      tail.next = b;
      b = b.next;
    }
    tail = tail.next;
  }
  tail.next = a ?? b;
  return dummy.next;
}
function sortList(head: ListNode | null): ListNode | null {
  if (!head || !head.next) return head;

  const mid = getMid(head);
  const rightHead = mid.next;
  mid.next = null;

  const leftSorted = sortList(head);
  const rightSorted = sortList(rightHead);

  return merge(leftSorted, rightSorted);
}
// @lc code=end

/*
// @lcpr case=start
// [4,2,1,3]\n
// @lcpr case=end

// @lcpr case=start
// [-1,5,3,4,0]\n
// @lcpr case=end

// @lcpr case=start
// []\n
// @lcpr case=end

 */
