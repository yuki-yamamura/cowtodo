export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Conventional Commitsでは小文字で始まるのが標準なので、sentence-caseを無効化
    "subject-case": [0, "never"],
    "body-max-line-length": [0, "always"],
    "footer-max-line-length": [0, "always"],
  },
};
