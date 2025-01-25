// eslint-disable-next-line spaced-comment
/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX, linewrap = require('ersatz-linewrap'),
  rxu = require('rxu');

function orf(x) { return x || false; }
function matchOrEmpty(t, r, g) { return (orf(t.match(r))[+g || 0] || ''); }


EX = function reformat(input) {
  var tx = input, tailBlanks = '\n', hadBom = matchOrEmpty(tx, /^\uFEFF\n?/);
  tx = tx.replace(/\r|\f|\v/g, '');
  if (hadBom) {
    tx = tx.slice(hadBom.length);
    tailBlanks = matchOrEmpty(tx, /\n+$/) || tailBlanks;
  }
  tx = tx.replace(/(?:^|\n)\t+/g,
    function g(m) { return m.replace(/\t/g, '  '); });
  tx = tx.replace(EX.colonAfterBoldKeywordShouldBeBoldAsWell, '$1:$2$3');
  tx = tx.replace(EX.listItemWithBoldKeywordColon,  '\n$1* __$2__\n$1  $3');
  tx = tx.replace(EX.listItemWithCodeKeywordColon,  '\n$1* $2\n$1  $3');
  tx = tx.replace(/\n {2,}\- /g, '\n  * ');
  tx = tx.replace(/((?:^|\n)`{3})(\S*)/g, EX.fixNoLangCodeBlock.bind(EX, {}));

  // Entirely bold lines are probably meant as minor headlines:
  tx = tx.replace(/(^|\n)\*{2}((?:(?!\*{2})[ -\uFFFF])+)\*{2}(?=\n|$)/g,
    '$1### $2');

  // Blank line after heading:
  tx = tx.replace(/\n(#{2,4}) (\S[ -\uFFFF]+)\n+/g, '\n$1 $2\n\n');
  // Adjust blank lines before headings:
  tx = tx.replace(/\n+(#{1,2} )/g, '\n\n\n\n$1');
  tx = tx.replace(/\n+(#{3,} )/g, '\n\n\n$1');

  tx = EX.unindentIndentedCodeBlocks(tx);
  tx = tx.replace(/\n+( *`{3}\w)/g, '\n\n$1');
  tx = tx.replace(/(^|\n)( *`{3})\n+/g, '$1$2\n\n');

  tx = linewrap(tx, { width: 80 });
  // tx = tx.replace(/((?:^|\n)[ -\uFFFF]{80})/g, '$1 ¦ ');
  tx = tx.trim();
  if (!tx) { throw new Error('Output would be empty!'); }
  return hadBom + tx + tailBlanks;
};


EX.colonAfterBoldKeywordShouldBeBoldAsWell = /(\w+)(\*{2}):(\s|$)/g;

EX.listItemKeywordRxBuilder = function liKwRx(fmtStart, kw, fmtEnd) {
  return rxu.join([
    /\n(?:\d+\.|( {2}|) *[\*\-]) /, /*
      Numbered list or indented bullet list */
    fmtStart, '(', kw, ':)', (fmtEnd || fmtStart),
    /\n? +(\S[ -\uFFFF]*)/,
  ].flat(), 'g');
};

EX.anythingButAsterisk = /[ -\)\+-\uFFFF]+/;
EX.anythingButBacktick = /[ -_a-\uFFFF]+/;
EX.listItemWithBoldKeywordColon = EX.listItemKeywordRxBuilder(/\*{2}/,
  EX.anythingButAsterisk);
EX.listItemWithCodeKeywordColon = EX.listItemKeywordRxBuilder('',
  [/`/, EX.anythingButBacktick, /`/]);


EX.unindentIndentedCodeBlocks = function u(tx) {
  /* … because indenting them with 3 spaces (as part of a list item) is insane.
    With respect to markdown, the correct way in our case would be to indent
    them with 2 or 4 spaces dependening on the nesting level of the list item
    they belong to, but not indenting them at all makes them easier to reuse.
  */
  tx = tx.replace(/(^|\n)( *`{3}\w+)(\n|$)/g, '$1\v$2$3');
  tx = tx.replace(/(^|\n)( +`{3})(\n|$)/g, '$1$2\v$3');
  // ^- Using \v (\x0B) as separator because it conveniently sits between
  //    \n (\x0A) and \f (\x0B), allowing for this range notation:
  tx = tx.replace(/\v( +)(`[\x00-\n\f-\uFFFF]+)/g, function unindent(m, s, o) {
    return o.replace(new RegExp('\n {1,' + s.length + '}', 'g'), m && '\n');
  });
  tx = tx.replace(/\v/g, '');
  return tx;
};



EX.fixNoLangCodeBlock = function fixNoLangCodeBlock(state, orig, intro, lang) {
  var prev = state.prevLang;
  if (!(lang || prev)) { lang = 'text'; }
  state.prevLang = lang;
  if (prev && lang) { return intro + '\n' + intro + lang; }
  // console.warn('fixNoLangCodeBlock', [intro, prev, lang]);
  return intro + lang;
};












module.exports = EX;
