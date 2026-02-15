/**
 * Orval 생성 코드의 URL 빌더 패치.
 *
 * 문제 1: 중첩 객체(e.g. { filters: { name: "x" } })를 toString()하면 [object Object]
 * 문제 2: 배열(e.g. { sort: ["a","b"] })을 toString()하면 "a,b"로 합쳐짐
 *
 * 수정: 중첩 객체는 flat하게 풀고, 배열은 각 요소를 개별 append.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "src/apis/generated/api.ts";

const source = readFileSync(FILE, "utf-8");

// Orval이 생성하는 원본 URLSearchParams 직렬화 블록 (공백 유동 대응)
const pattern =
  /  const normalizedParams = new URLSearchParams\(\);\n\n  Object\.entries\(params \|\| \{\}\)\.forEach\(\(\[key, value\]\) => \{\n\s*\n    if \(value !== undefined\) \{\n      normalizedParams\.append\(key, value === null \? 'null' : value\.toString\(\)\)\n    \}\n  \}\);\n\n  const stringifiedParams = normalizedParams\.toString\(\);/g;

const AFTER = `  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined) return;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.entries(value).forEach(([k, v]) => {
        if (v === undefined) return;
        if (Array.isArray(v)) { v.forEach(item => normalizedParams.append(k, item == null ? 'null' : String(item))); }
        else { normalizedParams.append(k, v === null ? 'null' : String(v)); }
      });
    } else if (Array.isArray(value)) {
      value.forEach(v => normalizedParams.append(key, v == null ? 'null' : String(v)));
    } else {
      normalizedParams.append(key, value === null ? 'null' : String(value));
    }
  });

  const stringifiedParams = normalizedParams.toString();`;

const matches = source.match(pattern);

if (!matches || matches.length === 0) {
  console.log(
    "patch-generated-api: 패치 대상 없음 (이미 적용됨 또는 패턴 변경)",
  );
  process.exit(0);
}

const patched = source.replace(pattern, AFTER);
writeFileSync(FILE, patched, "utf-8");

console.log(`patch-generated-api: ${matches.length}개 URL 빌더 패치 완료`);
