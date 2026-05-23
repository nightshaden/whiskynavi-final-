/**
 * Orval 생성 코드 패치 스크립트.
 *
 * 1) api.ts URL 빌더 패치
 *    - 중첩 객체(e.g. { filters: { name: "x" } })를 toString()하면 [object Object] 문제
 *    - 배열(e.g. { sort: ["a","b"] })을 toString()하면 "a,b"로 합쳐지는 문제
 *    → 중첩 객체는 flat하게 풀고, 배열은 각 요소를 개별 append.
 *
 * 2) mutator.ts 403 인증 에러 핸들링 패치
 *    - 403 응답 시 signOut 호출 후 AuthError throw
 */
import { readFileSync, writeFileSync } from "node:fs";

// ─── 1. api.ts URLSearchParams 패치 ───

const API_FILE = "src/apis/generated/api.ts";

let apiSource = readFileSync(API_FILE, "utf-8");

const urlParamsPattern =
  /  const normalizedParams = new URLSearchParams\(\);\n\n  Object\.entries\(params \|\| \{\}\)\.forEach\(\(\[key, value\]\) => \{\n\s*\n    if \(value !== undefined\) \{\n      normalizedParams\.append\(key, value === null \? 'null' : value\.toString\(\)\)\n    \}\n  \}\);\n\n  const stringifiedParams = normalizedParams\.toString\(\);/g;

const URL_PARAMS_REPLACEMENT = `  const normalizedParams = new URLSearchParams();

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

const apiMatches = apiSource.match(urlParamsPattern);

if (!apiMatches || apiMatches.length === 0) {
  console.log("patch api.ts: 패치 대상 없음 (이미 적용됨 또는 패턴 변경)");
} else {
  apiSource = apiSource.replace(urlParamsPattern, URL_PARAMS_REPLACEMENT);
  console.log(`patch api.ts: ${apiMatches.length}개 URL 빌더 패치 완료`);
}

// ─── 1-b. 충돌하기 쉬운 operationId 별칭 패치 ───

const KV_STORE_UPDATE_ALIAS = "\nexport const updateKvStore = update1;\n";

if (apiSource.includes("export const update1 = async") && !apiSource.includes("export const updateKvStore = update1")) {
  apiSource = `${apiSource}${KV_STORE_UPDATE_ALIAS}`;
  console.log("patch api.ts: KV store update 별칭 패치 완료");
}

writeFileSync(API_FILE, apiSource, "utf-8");

// ─── 2. mutator.ts 403 인증 에러 핸들링 패치 ───

const MUTATOR_FILE = "src/apis/mutator.ts";

let mutatorSource = readFileSync(MUTATOR_FILE, "utf-8");
let mutatorPatched = false;

// 2-a. import 추가
if (!mutatorSource.includes('import { AuthError } from "./errors"')) {
  mutatorSource = `import { AuthError } from "./errors";\n\n${mutatorSource}`;
  mutatorPatched = true;
}

// 2-b. 403 핸들링 블록 추가 (res.ok 체크 직전에 삽입)
if (!mutatorSource.includes("res.status === 403")) {
  const AUTH_BLOCK = `  if (res.status === 403) {
    if (typeof window !== "undefined") {
      const { signOut } = await import("next-auth/react");
      await signOut({ callbackUrl: "/sign-in" });
    }
    throw new AuthError();
  }

`;
  mutatorSource = mutatorSource.replace("  if (!res.ok) {", `${AUTH_BLOCK}  if (!res.ok) {`);
  mutatorPatched = true;
}

if (mutatorPatched) {
  writeFileSync(MUTATOR_FILE, mutatorSource, "utf-8");
  console.log("patch mutator.ts: 403 인증 에러 핸들링 패치 완료");
} else {
  console.log("patch mutator.ts: 이미 적용됨");
}
