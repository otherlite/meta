import { transformFileSync, transform } from '@babel/core';
import { join } from 'path';
import { readdirSync, readFileSync } from 'fs';
import plugin from '../src/index';

describe('mixed', () => {
  afterEach(() => {
    global.__clearBabelAntdPlugin();
  });

  const fixturesDir = join(__dirname, 'mixed');
  let fixtures = readdirSync(fixturesDir);
  const onlyFixtures = fixtures.filter(fixture => fixture.indexOf('-only') > -1);

  if (onlyFixtures.length) {
    fixtures = onlyFixtures;
  }

  fixtures.map(caseName => {
    const fixtureDir = join(fixturesDir, caseName);
    const actualFile = join(fixtureDir, 'actual.js');
    const expectedFile = join(fixtureDir, 'expected.js');

    it(`should work with ${caseName.split('-').join(' ')}`, () => {
      let pluginWithOpts;
      caseName = caseName.replace(/-only$/, '');
      if (caseName === 'import-css') {
        pluginWithOpts = [plugin, { libraryName: 'antd', style: true, federation: true }];
      } else if (caseName === 'material-ui') {
        pluginWithOpts = [
          plugin,
          {
            libraryName: 'material-ui',
            libraryDirectory: '',
            camel2DashComponentName: false,
            federation: true,
          },
        ];
      } else if (caseName === 'keep-named-import') {
        pluginWithOpts = [
          plugin,
          { libraryName: 'stream', transformToDefaultImport: false, federation: true },
        ];
      } else if (caseName === 'react-toolbox') {
        pluginWithOpts = [
          plugin,
          { libraryName: 'react-toolbox', camel2UnderlineComponentName: true, federation: true },
        ];
      } else if (caseName === 'use-multiple-times') {
        pluginWithOpts = [plugin, { libraryName: 'antd-mobile', federation: true }];
      } else if (caseName === 'file-name') {
        pluginWithOpts = [
          plugin,
          {
            libraryName: 'antd-mobile-fake-2.0',
            fileName: 'index.native',
            federation: true,
          },
        ];
      } else if (caseName === 'custom-name') {
        pluginWithOpts = [
          plugin,
          {
            libraryName: 'plat/antd',
            customName: name => `antd/lib/${name}`,
            federation: true,
          },
        ];
      } else if (caseName === 'custom-name-source-file') {
        pluginWithOpts = [
          plugin,
          {
            libraryName: 'plat/antd',
            customName: join(__dirname, 'mixed', 'custom-name-source-file', 'customName.js'),
            federation: true,
          },
        ];
      } else if (caseName === 'custom-style-path') {
        pluginWithOpts = [
          plugin,
          {
            libraryName: 'antd',
            style: name => `${name}/style/2x`,
            federation: true,
          },
        ];
      } else if (caseName === 'custom-style-path-ignore') {
        pluginWithOpts = [
          plugin,
          {
            libraryName: 'antd',
            style: name => {
              if (name === 'common/antd/lib/animation') {
                return false;
              }
              return `${name}/style/2x`;
            },
            federation: true,
          },
        ];
      } else if (caseName === 'style-library-name') {
        pluginWithOpts = [
          plugin,
          {
            libraryName: 'element-ui',
            styleLibraryDirectory: 'lib/theme-chalk',
            federation: true,
          },
        ];
      } else if (caseName === 'custom-style-name') {
        pluginWithOpts = [
          plugin,
          {
            libraryName: 'element-ui',
            customStyleName: name => `element-ui/lib/theme-light/${name}`,
            federation: true,
          },
        ];
      } else if (caseName === 'custom-style-name-file') {
        pluginWithOpts = [
          plugin,
          {
            libraryName: 'element-ui',
            customStyleName: (name, file) => {
              const { root, filename } = file?.opts;
              const diff = filename?.slice(root?.length);
              const count = diff.match(/\//g).length;
              const prefix = String.prototype.repeat.call('../', count);
              return `${prefix}element-ui/lib/theme-light/${name}`;
            },
            federation: true,
          },
        ];
      } else {
        pluginWithOpts = [plugin, { libraryName: 'antd', federation: true }];
      }

      const actual = (function () {
        if (caseName === 'modules-false') {
          return transform(readFileSync(actualFile), {
            presets: ['umi'],
            plugins: [[plugin, { libraryName: 'antd', style: true, federation: true }]],
          }).code;
        } else if (caseName === 'multiple-libraries') {
          return transformFileSync(actualFile, {
            presets: ['@babel/preset-react'],
            plugins: [
              [plugin, { libraryName: 'antd', federation: true }, 'antd'],
              [plugin, { libraryName: 'antd-mobile', federation: true }, 'antd-mobile'],
            ],
          }).code;
        } else if (caseName === 'multiple-libraries-hilojs') {
          return transformFileSync(actualFile, {
            presets: ['@babel/preset-react'],
            plugins: [
              [plugin, { libraryName: 'antd', federation: true }, 'antd'],
              [
                plugin,
                {
                  libraryName: 'hilojs',
                  customName(name) {
                    switch (name) {
                      case 'class':
                        return `hilojs/core/${name}`;
                      default:
                        return `hilojs/${name}`;
                    }
                  },
                  federation: true,
                },
                'hilojs',
              ],
            ],
          }).code;
        } else if (caseName === 'super-class') {
          return transformFileSync(actualFile, {
            plugins: [[plugin, { libraryName: 'antd', federation: true }]],
            babelrc: false,
          }).code;
        } else {
          return transformFileSync(actualFile, {
            presets: ['@babel/preset-react'],
            plugins: [pluginWithOpts || plugin],
          }).code;
        }
      })();

      if (onlyFixtures.length) {
        console.warn();
        console.warn(actual);
      }

      const expected = readFileSync(expectedFile, 'utf-8');
      expect(actual.trim()).toEqual(expected.trim());
    });
  });
});