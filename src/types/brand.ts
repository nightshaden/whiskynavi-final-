export type LineupItem = {
  id: string;
  image: string;
  caption: string;
  size: "short" | "long";
};

export interface Brand {
  id: string;
  bgImage: string;
  icon: string;
  iconSize: { width: number; height: number };
  name: string;
  subname: string;
  description: string;
}
