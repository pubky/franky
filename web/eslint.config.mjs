import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: ["spellcheck"],
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "spellcheck/spell-checker": [
        "warn",
        {
          comments: true,
          strings: false,
          identifiers: false,
          lang: "en_US",
          skipWords: ["dexie", "indexeddb", "db"],
          skipIfMatch: [
            "http://[^s]*",
            "^[-\\w]+/[-\\w\\.]+$" // For import paths
          ]
        }
      ]
    }
  }
];

export default eslintConfig;
