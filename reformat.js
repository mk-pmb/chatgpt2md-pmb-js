// eslint-disable-next-line spaced-comment
/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX, linewrap = require('ersatz-linewrap');


EX = function reformat(input) {
  var tx = input;
  tx = tx.replace(/\n\d+\. \*{2}([ -\)\+-\uFFFF]+)\*{2}:\s+(\S[ -\uFFFF]*)/g,
    '\n* __$1:__\n  $2');
  tx = linewrap(tx, { width: 80 });
  // tx = tx.replace(/((?:^|\n)[ -\uFFFF]{80})/g, '$1 ¦ ');
  return tx;
};


module.exports = EX;
