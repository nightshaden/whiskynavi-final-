import { readFile, writeFile } from "fs/promises";
import path from "path";

export interface YoutubeConfig {
  embedUrl: string;
  channelUrl: string;
}

const CONFIG_PATH = path.join(
  process.cwd(),
  "src/data/youtube-config.json"
);

export async function getYoutubeConfig(): Promise<YoutubeConfig> {
  const raw = await readFile(CONFIG_PATH, "utf-8");
  return JSON.parse(raw) as YoutubeConfig;
}

export async function updateYoutubeConfig(
  config: YoutubeConfig
): Promise<void> {
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");
}
