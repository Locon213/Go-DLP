#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-}"
OUTPUT_FILE="${2:-release_notes.md}"

if [[ -z "$VERSION" ]]; then
  echo "Usage: $0 <version> [output-file]"
  exit 1
fi

CURRENT_TAG="v${VERSION}"

PREV_TAG="$(git tag --sort=-v:refname | grep -E '^v[0-9]+(\.[0-9]+){1,2}$' | grep -v "^${CURRENT_TAG}$" | head -n 1 || true)"

if [[ -n "$PREV_TAG" ]]; then
  RANGE="${PREV_TAG}..HEAD"
else
  RANGE="HEAD"
fi

mapfile -t COMMITS < <(git log --pretty=format:'%s' ${RANGE})

clean_commit() {
  local msg="$1"
  msg="$(echo "$msg" | sed -E 's/^(feat|fix|perf|refactor|docs|test|chore|ci|build|style|revert)(\([^)]+\))?:[[:space:]]*//')"
  echo "$msg"
}

add_section() {
  local title="$1"
  shift
  local entries=("$@")

  if [[ ${#entries[@]} -eq 0 ]]; then
    return
  fi

  echo "## ${title}" >> "${OUTPUT_FILE}"
  echo "" >> "${OUTPUT_FILE}"
  for entry in "${entries[@]}"; do
    echo "- ${entry}" >> "${OUTPUT_FILE}"
  done
  echo "" >> "${OUTPUT_FILE}"
}

features=()
fixes=()
performance=()
refactors=()
docs=()
other=()

for commit in "${COMMITS[@]}"; do
  [[ -z "$commit" ]] && continue
  cleaned="$(clean_commit "$commit")"
  lower="$(echo "$commit" | tr '[:upper:]' '[:lower:]')"

  if [[ "$lower" =~ ^feat(\(.*\))?: ]]; then
    features+=("$cleaned")
  elif [[ "$lower" =~ ^fix(\(.*\))?: ]]; then
    fixes+=("$cleaned")
  elif [[ "$lower" =~ ^perf(\(.*\))?: ]]; then
    performance+=("$cleaned")
  elif [[ "$lower" =~ ^refactor(\(.*\))?: ]]; then
    refactors+=("$cleaned")
  elif [[ "$lower" =~ ^docs(\(.*\))?: ]]; then
    docs+=("$cleaned")
  else
    other+=("$commit")
  fi
done

{
  echo "# Go-DLP ${CURRENT_TAG}"
  echo ""
  echo "Release date: $(date -u +'%Y-%m-%d %H:%M UTC')"
  echo ""
  echo "This release is automatically generated from project commits."
  echo ""
} > "${OUTPUT_FILE}"

add_section "Highlights" "${features[@]}"
add_section "Fixes" "${fixes[@]}"
add_section "Performance" "${performance[@]}"
add_section "Refactoring" "${refactors[@]}"
add_section "Documentation" "${docs[@]}"
add_section "Other Changes" "${other[@]}"

if [[ -n "$PREV_TAG" ]]; then
  echo "Full diff: https://github.com/Locon213/Go-DLP/compare/${PREV_TAG}...${CURRENT_TAG}" >> "${OUTPUT_FILE}"
else
  echo "Full changelog: https://github.com/Locon213/Go-DLP/commits/${CURRENT_TAG}" >> "${OUTPUT_FILE}"
fi
