// eslint-disable-next-line spaced-comment
/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

require('txtrafo')({
  sourceFilename: (process.argv[2] || '-'),
  trafoFunc: require('./reformat.js'),
  outputFilename: '-',
});
