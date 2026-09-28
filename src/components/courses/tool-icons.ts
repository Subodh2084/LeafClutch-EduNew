import type { IconType } from "react-icons";
import {
  SiExpress,
  SiFigma,
  SiJavascript,
  SiJupyter,
  SiMongodb,
  SiMongoose,
  SiNodedotjs,
  SiNumpy,
  SiPandas,
  SiPostgresql,
  SiPython,
  SiReact,
  SiScikitlearn,
} from "react-icons/si";

/**
 * Logo for each CourseTool.icon key. A key that isn't listed (or no key)
 * falls back to the tool's initial, so new tools never break the page.
 */
export const toolIcons: Record<string, IconType> = {
  express: SiExpress,
  figma: SiFigma,
  javascript: SiJavascript,
  jupyter: SiJupyter,
  mongodb: SiMongodb,
  mongoose: SiMongoose,
  nodejs: SiNodedotjs,
  numpy: SiNumpy,
  pandas: SiPandas,
  postgresql: SiPostgresql,
  python: SiPython,
  react: SiReact,
  "scikit-learn": SiScikitlearn,
};
