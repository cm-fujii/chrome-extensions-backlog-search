# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Backlogサービスの検索機能を強化するChrome拡張機能。課題番号（例：1, 26, 205）を検索ボックスに入力すると、該当課題を直接開くボタンを表示する。

## 開発環境のセットアップ

### 拡張機能の読み込み
```bash
# 1. Chrome://extensions/を開く
# 2. デベロッパーモードを有効化
# 3. 「パッケージ化されていない拡張機能を読み込む」をクリック
# 4. srcフォルダを選択
```

### 変更の反映
拡張機能を更新した後は、chrome://extensions/で「更新」ボタンをクリックして変更を反映させる。

## アーキテクチャ

### コア機能の実装構造

#### content.js - メインロジック
- **課題番号検出**: `isIssueNumber()` - 入力が有効な課題番号（1以上の数字）かを判定
- **プロジェクトキー取得**: `getProjectKey()` - URLパスから現在のプロジェクトキーを抽出
- **存在確認**: `checkIssueExists()` - fetch APIでHEADリクエストを送信し課題の存在を確認
- **UI更新**: `addElementsToSearchBox()` - オプション設定に基づいてボタンまたはエラーメッセージを表示

#### ストレージ連携
- `chrome.storage.sync`を使用してオプション設定を保存・同期
- デフォルト値: `checkIssueExists: true`（課題の存在確認はON）

#### DOM監視戦略
- MutationObserverで動的に追加される検索ボックスを監視
- 2秒ごとのポーリングでSPA環境での検索ボックス出現に対応
- デバウンス処理（300ms）で過剰な処理を防止

### 対象サイトとURL構造

**対象ドメイン**:
- `*.backlog.com/*`
- `*.backlog.jp/*`

**プロジェクトキー取得パターン**:
- `/projects/XXX` → XXX
- `/find/XXX` → XXX
- `/board/XXX` → XXX
- `/view/XXX-123` → XXX

**課題URL生成**: `https://[domain]/view/[project-key]-[issue-number]`

## 重要な実装詳細

### 検索ボックスの特定
優先順位の高いセレクタから順に検索:
1. `#globalSearch` - Backlogのメイン検索ボックス
2. `.search-box__input` - クラス名での特定
3. `[name="searchProject"]` - name属性での特定

### エラーハンドリング
- 課題が存在しない場合: 警告メッセージ（黄色背景）を表示
- ネットワークエラー時: 課題が存在しないものとして扱う

### パフォーマンス最適化
- 入力完了後500msで存在確認を実行（ユーザーが入力を終えるのを待つ）
- 既存のボタンやメッセージは新規作成前に削除して重複を防ぐ

## 仕様書の場所

詳細な仕様と要件は `/spec/01_update.md` に記載されている。新機能追加や仕様変更時は必ずこのファイルを確認すること。