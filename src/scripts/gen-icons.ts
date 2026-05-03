// /scripts/gen-icons.ts
import fs from "node:fs";
import path from "node:path";

const ICONS_DIR = path.resolve(process.cwd(), "src/icons");
const OUTPUT = path.join(ICONS_DIR, "index.tsx");

// foo-bar.svg -> FooBar
const toPascal = (s: string) =>
  s
    .replace(/\.svg$/i, "")
    .split(/[^a-zA-Z0-9]+/g)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");

function main() {
  if (!fs.existsSync(ICONS_DIR)) {
    throw new Error(`Not found: ${ICONS_DIR}`);
  }

  const files = fs
    .readdirSync(ICONS_DIR)
    .filter((f) => f.toLowerCase().endsWith(".svg"))
    .sort();

  const lines: string[] = [];
  lines.push(`/* AUTO-GENERATED FILE. DO NOT EDIT. */`);
  lines.push(`import * as React from 'react';`);
  lines.push(`\nexport type IconProps = React.SVGProps<SVGSVGElement> & { size?: number | string; title?: string };\n`);

  // 각 SVG를 import 해서 래핑
  for (const file of files) {
    const base = path.basename(file);
    const name = toPascal(base);
    // 개별 import
    lines.push(`import ${name}Svg from './${base}';`);
  }

  lines.push("\n");

  for (const file of files) {
    const base = path.basename(file);
    const name = toPascal(base);
    // 공통 래퍼: size -> width/height, className 그대로 전달
    lines.push(`
export const Icon${name}: React.FC<IconProps> = ({ size = 20, title, ...rest }) => {
  return <${name}Svg width={size} height={size} aria-hidden={title ? undefined : true} title={title} {...rest} />;
};
`);
  }

  // 네임드 export 모음
  //   const exports = files.map((f) => `Icon${toPascal(f)}`).join(', ');
  //   lines.push(`\nexport { ${exports} };\n`);

  fs.writeFileSync(OUTPUT, lines.join("\n"), "utf8");
   
  console.log(`Generated: ${path.relative(process.cwd(), OUTPUT)} with ${files.length} icons.`);
}

main();
