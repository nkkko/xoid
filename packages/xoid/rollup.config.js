import typescript from 'rollup-plugin-typescript2';
const makeConfig = require('../helpers/make-config')

export default makeConfig({
  source: 'lib', 
  destination: 'dist',
  entries: {
    'index.tsx': { 
      cjs: 'index.js', 
      esm: 'esm/index.js', 
      external: ['@xoid/core', '@xoid/model'] 
    },
  },
  copy: { 'package.json': 'dist' },
  getPlugins: () => ([typescript({ useTsconfigDeclarationDir: true })])
})