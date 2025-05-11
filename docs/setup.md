# セットアップ手順

## 開発環境のセットアップ

### Notion APIの設定

Notionとの連携のためには、以下の手順でAPIキーを設定する必要があります：

1. `.mcp.json.sample`ファイルを`.mcp.json`にコピーします：
   ```bash
   cp .mcp.json.sample .mcp.json
   ```

2. `.mcp.json`ファイル内の`YOUR_NOTION_API_KEY_HERE`を、実際のNotion APIキーに置き換えてください。

> **重要**: `.mcp.json`ファイルはGitリポジトリに含まれていません。これは秘密のAPIキーを保護するためです。このファイルを絶対にコミットしないでください。