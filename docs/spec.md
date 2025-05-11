# Cowtodo 要件定義

## 概要

Cowtodoは、引数で受け取ったテキストファイル内のTask list itemsを解析して、cowsayを経由して標準出力に表示するCLIツールです。

## 実行例

```
$ cowtodo todos.md
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

入力ファイル例:
```
// todos.md
foo
bar
hoge

- [ ] task_1
- [ ] task_2
  - [x] sub_task_1
  - [ ] sub_task_2
- [x] task_3
  - [x] sub_task_1

a
b
c
```

## 技術スタック

- TypeScript
- React
- Node.js
- tsx (https://github.com/privatenumber/tsx)
- Ink (https://github.com/vadimdemedes/ink)
- cowsay (https://github.com/piuccio/cowsay)

## 機能要件

### 実行環境
- Node.js v22で実行できること
- グローバルインストールのみ対応
- Dockerに対応する必要はない

### 入力ファイル
- ファイルの形式は問わないが、Markdownを想定
- 複数ファイルを受け取れること

### Task list itemの扱い
- 完了していないTask list itemsはBacklogとしてグルーピングする
- 完了したTask list itemsはDoneとしてグルーピングする
- グルーピングはファイルを跨いで解析する
- 1ファイルに複数のTask listが存在する場合、それらすべてを表示する
- サブタスクの深さに制限はない

### グループ内の表示順
- ファイル内の並び順と表示順を一致させる
- 複数ファイルが指定された場合は、引数で指定されたファイルの順番に表示する

### 完了の条件
- Task list itemにチェックが入っている
- サブタスクを持つ場合は、そのTask list itemとすべてのサブタスクにチェックが入っている

### テキスト解析
- Task list itemsの扱いはGitHub Flavored Markdownの仕様に従う
  - 参照: [Task list items specification](https://github.github.com/gfm/#task-list-items-extension-)

### コマンドライン引数
- ヘルプオプション（-h, --help）に対応する
- コマンドライン引数で受け取るファイル数に上限は設けない

### 出力フォーマット
- cowsayのキャラクターは常にデフォルトでよい
- 出力の文字数制限はしない

### エラーハンドリング
- 引数で指定されたファイルが存在しない場合、エラーを標準出力に表示してExit Code 1で終了する
- 引数で指定されたファイルが削除された場合、エラーを標準出力に表示してExit Code 1で終了する

## 非機能要件

### パフォーマンス
- 大量のファイルや巨大なファイルを処理する場合でも、メモリ使用量を抑える設計にする

### メンテナンス性
- コードは可読性を重視し、適切なコメントを付ける
- モジュール分割を行い、テスト容易性を確保する

### スケーラビリティ
- 将来的な機能拡張（フィルタリングやソートなど）を考慮した設計にする

### テスト
- 主要機能のユニットテストを実装する
- エッジケースを考慮したテストケースを作成する