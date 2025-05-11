# Cowtodo 要件定義

## 概要

Cowtodoは、引数で受け取ったMarkdownファイル内のタスクリストアイテムを解析して表示するCLIツールです。デフォルトではcowsayを使った表示形式を提供し、オプションで構造化された表示も可能です。また、ファイルの変更をリアルタイムに監視し、変更があれば表示を更新します。

## 実行例

### デフォルト表示（cowsay）

```
$ cowtodo README.md
Monitoring files: README.md

 ____________________
/ ## Backlog         \
| - [ ] task_1       |
| - [ ] task_2       |
|   - [x] sub_task_1 |
|   - [ ] sub_task_2 |
|                    |
| ## Done            |
| - [x] task_3       |
\   - [x] sub_task_1 /
 --------------------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
```

### 構造化表示（--tasksオプション）

```
$ cowtodo README.md --tasks
## Backlog
- [ ] task_1
- [ ] task_2
  - [x] sub_task_1
  - [ ] sub_task_2

## Done
- [x] task_3
```

### 詳細表示（--tasksと--detailedオプションの組み合わせ）

```
$ cowtodo README.md --tasks --detailed
README.md (3)
- [ ] task_1
- [ ] task_2
  - [x] sub_task_1
  - [ ] sub_task_2
- [x] task_3
  - [x] sub_task_1
```

入力ファイル例:

```markdown
// README.md

# Project Title

Some description here.

## Tasks

- [ ] task_1
- [ ] task_2
  - [x] sub_task_1
  - [ ] sub_task_2
- [x] task_3
  - [x] sub_task_1

## Other Section

Some other content.
```

## 技術スタック

- TypeScript
- React
- Node.js
- Ink (リッチCLIインターフェース用)
- cowsay (ASCII表示用)
- meow (コマンドライン引数解析用)

## 機能要件

### 実行環境

- Node.js v16以上で実行できること
- npm/yarn経由でのグローバルインストールに対応
- ESMモジュール形式で実装

### 入力ファイル

- Markdownファイルを解析対象とする
- 複数ファイルを受け取り、一括して解析可能
- ファイルの変更を監視し、リアルタイムに表示を更新

### タスクリストアイテムの解析と表示

- GitHub Flavored Markdownの仕様に従ったタスクリストアイテムを解析
- 未完了タスクは「Backlog」セクションに表示
- 完了タスクは「Done」セクションに表示
- 親子関係を持つネストされたタスクをサポート
- タスクの階層構造（インデント）を保持して表示

### 完了条件

- タスクにチェックが入っている (`[x]` または `[X]`)
- サブタスクを持つ場合は、そのタスクとすべてのサブタスクにチェックが入っている場合のみ「Done」として表示
- サブタスクが未完了の場合、親タスクにチェックが入っていても「Backlog」セクションに表示

### 表示順序

- ファイル内の出現順序を保持
- 複数ファイルが指定された場合は、コマンドライン引数で指定された順序で表示
- 同一ファイル内では、タスクの行番号順にソート

### 表示モード

- デフォルト: cowsayを使用した表示
- `--tasks`: 構造化された表示（cowsayなし）
- `--detailed`: ファイルごとにタスクをグループ化して表示（`--tasks`と組み合わせて使用）
- `--verbose`: 詳細情報を表示

### コマンドライン引数

```
Usage
  $ cowtodo <file> [options]

Arguments
  <file>  Path to a markdown file to read

Options
  --tasks    Show tasks in structured view (default: cowsay view)
  --detailed Show task details by file (with --tasks)
  --verbose  Show verbose output
  --version  Show version
  --help     Show this help message

Examples
  $ cowtodo README.md
  $ cowtodo docs/todo.md --verbose
  $ cowtodo docs/todo.md --tasks
  $ cowtodo docs/todo.md --tasks --detailed
```

### エラーハンドリング

- 指定されたファイルが存在しない場合、エラーメッセージを表示
- ファイルの読み込みに失敗した場合、エラーを表示しつつ他のファイルの処理を続行
- エラーメッセージはUIの一部として表示し、ユーザーにフィードバックを提供

## 実装詳細

### タスク解析

- Markdownテキストからタスクリストアイテムを正規表現で抽出
- タスクの階層構造を解析し、親子関係を構築
- タスクのコンテキスト（見出し情報）を抽出して関連付け

### ファイル監視

- Node.jsのfsモジュールを使用してファイルの変更を監視
- ファイルが変更された場合、内容を再読み込みして表示を更新
- 更新されたファイルは一時的にハイライト表示

### UIコンポーネント

- `App`: メインアプリケーションコンポーネント
- `TaskView`: タスク表示用コンポーネント
- `FileViewer`: ファイル内容表示用コンポーネント

### データ構造

- `TodoTask`: 基本的なタスク情報
- `TodoTaskWithContext`: コンテキスト情報を含むタスク
- `FileTask`: ファイル情報を含むタスク
- `TaskCollection`: タスクのコレクション（全タスク、ファイル別タスク、統計情報）

## 非機能要件

### パフォーマンス

- 大量のファイルや巨大なファイルでも効率的に処理
- 必要に応じて非同期処理を活用

### メンテナンス性

- 関数型プログラミングの原則に従った実装
- アロー関数とTypeScriptの型システムを活用した堅牢なコード
- 適切なコメントと説明的な関数名・変数名の使用

### ユーザーエクスペリエンス

- ファイル監視による自動更新
- リアルタイムなフィードバック
- 見やすい表示形式の選択肢を提供

### 拡張性

- モジュール化された設計
- 将来的な機能追加（フィルタリング、ソート、エクスポートなど）を容易にする構造
