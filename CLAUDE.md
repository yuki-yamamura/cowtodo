# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cowtodo is a CLI tool that lists TODO items in Markdown files.

## Repository Structure

This is a new project with minimal files so far. The project structure will evolve as development progresses.

## Development Setup

The project is just starting out. As development tools, dependencies, and build processes are established, they will be documented here.

## Coding Conventions

### General

- ユーザーとの対話には日本語を使用する
- ユーザーの指示なしに次のタスクを開始しない
- `~/.ssh`にアクセスしない

### Commit Messages

- コミットメッセージは英語で書く
- Conventional Commits のルールに従う
  - 例: `feat: add new command line option`, `fix: resolve parsing issue`, `docs: update README`

### Code Comments

- コード内コメントは英語で書く

## Task Management

- Notion の`test_tasks`でタスク管理を行う
- Notion の`test_tasks`以外のページは参照しない
- ワークフローが途中で失敗した場合、ユーザーに判断を委ねる

### Task Workflow

#### Parent Task

親タスクの PR が作成されていない場合、以下の手順に従う:

1. 親タスクの状態を「着手中」に変更
2. Git で main からブランチを作成 (ブランチ名は`story/<タスクID>`とする)
3. 空コミットを作成 (コミットメッセージは`chore: start story/<タスクID>`とする)
4. PR を作成 (`gh pr create --assignee @me --base main --draft`)
   - タイトルはタスクのタイトルを参照する (`【<タスクID>】<タイトル>`)
   - ボディはタスクの内容から生成する (Notion タスクへのリンクを含める)

#### Sub-Task

サブタスク開始時の手順:

1. サブタスクの状態を「着手中」に変更
2. タスクの開始日時を設定 (時間まで記載すること)
3. Git で親タスクからブランチを作成 (ブランチ名は`feature/<タスクID>`とする)
4. 空コミットを作成 (コミットメッセージは`chore: start feature/<タスクID>`とする)
5. PR を作成 (`gh pr create --assignee @me --base <親タスク> --draft`)
   - タイトルはタスクのタイトルを参照する (`【<タスクID>】<タイトル>`)
   - ボディはタスクの内容から生成する (Notion タスクへのリンクを含める)
6. 実装計画を考えて、ユーザーに伝える

#### Task Completion

サブタスク完了時の手順:

1. PR のステータスを ready にする
2. PR をマージ (`gh pr merge --merge --auto --delete-branch`)
3. タスクの開始日時を設定 (時間まで記載すること)
4. タスクに「サマリー」を追加
   - コマンドライン履歴とコンテキストを参照して、振り返りを効率化するための文章を作成
   - Notion の見出しは「振り返り」とする
5. タスクの状態を「完了」に変更
6. タスクの完了日時を記載 (時間まで記載すること)

## Code Review

ユーザーから PR のレビュー依頼があった場合、以下の観点でコードのレビューを行う:

- 仕様をすべて満たしているか確認
- タスクにチェックリストがある場合、すべてにチェックが入っているか確認
- タイポがないか確認
- コードベースの一貫性を保てているか確認
- より好ましい実装があればユーザーに提案
