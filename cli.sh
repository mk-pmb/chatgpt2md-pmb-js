#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function chatgpt2md_cli_main () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFFILE="$(readlink -f -- "$BASH_SOURCE")"
  local DOIT=( node "${SELFFILE%.sh}.js" )

  case "$1" in
    -i | --inplace ) shift; chatgpt2md_inplace "$@"; return $?;;
  esac

  "${DOIT[@]}" "$@"; return $?
}


function chatgpt2md_inplace () {
  local TX=
  TX="$( "${DOIT[@]}" "$@"; echo : )" || return $?
  TX="${TX%:}"
  [[ "$TX" == *[A-Za-z]* ]] || return 4$(
    echo E: $FUNCNAME: 'No letters in output' >&2)
  local TMPF="$(mktemp)"
  echo "$TX" >"$TMPF"
  mv --no-target-directory -- "$TMPF" "$1" || return $?
}










chatgpt2md_cli_main "$@"; exit $?
