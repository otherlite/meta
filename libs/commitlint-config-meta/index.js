/**
 * https://commitlint.js.org/#/reference-prompt title和emoji还未支持，有时间可以提个PR
 * https://github.com/conventional-changelog/commitlint/blob/7f4fcc24a1ee6bf1ebc181b3d85f9e5e3bdf8b32/%40commitlint/cz-commitlint/src/services/getRuleQuestionConfig.ts#L45-L57
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test', 'type', 'wip', 'workflow'],
    ],
  },
  prompt: {
    messages: {
      skip: ':skip',
      max: 'upper %d chars',
      min: '%d chars at least',
      emptyWarning: 'can not be empty',
      upperLimitWarning: 'over limit',
      lowerLimitWarning: 'below limit',
    },
    questions: {
      type: {
        description: '请选择本次提交的类型',
        enum: {
          feat: {
            description: '一个新功能',
            title: 'Features',
            emoji: '✨',
          },
          fix: {
            description: '错误修复',
            title: 'Bug Fixes',
            emoji: '🐛',
          },
          docs: {
            description: '仅文档更改',
            title: 'Documentation',
            emoji: '📚',
          },
          style: {
            description: '不影响代码含义的更改(空格、格式、缺少分号等)',
            title: 'Styles',
            emoji: '💎',
          },
          refactor: {
            description: '重构(既不修复错误也不添加功能的代码更改)',
            title: 'Code Refactoring',
            emoji: '📦',
          },
          perf: {
            description: '提高性能的代码更改',
            title: 'Performance Improvements',
            emoji: '🚀',
          },
          test: {
            description: '添加缺失的测试或纠正现有的测试',
            title: 'Tests',
            emoji: '🚨',
          },
          build: {
            description: '影响构建系统或外部依赖项的更改(示例范围: Webpack、Docker、Pnpm）',
            title: 'Builds',
            emoji: '🛠',
          },
          ci: {
            description: '对我们的 CI 配置文件和脚本的更改(示例范围: Travis、Circle、BrowserStack、SauceLabs)',
            title: 'Continuous Integrations',
            emoji: '⚙️',
          },
          chore: {
            description: '不修改 src 或测试文件的其他更改',
            title: 'Chores',
            emoji: '♻️',
          },
          revert: {
            description: '恢复之前的提交',
            title: 'Reverts',
            emoji: '🗑',
          },
          type: {
            description: '添加缺失的类型或纠正现有的类型',
            title: 'Types',
            emoji: '🏁',
          },
          wip: {
            description: '工作正在进行中的提交',
            title: 'Wips',
            emoji: '🚧',
          },
          workflow: {
            description: '工作流程的修改提交',
            title: 'workflows',
            emoji: '🔀',
          },
        },
      },
      scope: {
        description: '此更改的范围是什么（例如组件或文件名）',
      },
      subject: {
        description: '写一个简短的主谓宾语句描述变化',
      },
      body: {
        description: '提供更详细的更改说明',
      },
      isBreaking: {
        description: '有破坏性的改动吗？',
      },
      breakingBody: {
        description: '一个破坏性的改动需要提供更详细的更改说明，请输入对提交本身的更长描述',
      },
      breaking: {
        description: '描述破坏性的改动',
      },
      isIssueAffected: {
        description: '此更改是否会影响任何未解决的问题？',
      },
      issuesBody: {
        description: '如果问题已关闭，则需要提交更详细的更改说明。请输入对提交本身的更长描述',
      },
      issues: {
        description: '添加问题关联单号（例如"fix #123"、"re #123"。）',
      },
    },
  },
}
