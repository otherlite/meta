import { transformFileSync, transform } from '@babel/core';
import { join } from 'path';
import { readdirSync, readFileSync } from 'fs';
import plugin from '../src/index';

describe('federation', () => {
  afterEach(() => {
    global.__clearBabelAntdPlugin();
  });

  const fixturesDir = join(__dirname, 'federation');
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
      let pluginWithOpts = [plugin, { libraryName: 'antd', federation: 'only' }];

      const actual = (function () {
        return transformFileSync(actualFile, {
          presets: ['@babel/preset-react'],
          plugins: [pluginWithOpts || plugin],
        }).code;
      })();

      const expected = readFileSync(expectedFile, 'utf-8');
      expect(actual.trim()).toEqual(expected.trim());
    });
  });
});
