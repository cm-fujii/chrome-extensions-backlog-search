# update

本リポジトリは、Chrome拡張機能を管理しています。

## 拡張機能の内容

Backlogサービスの検索機能を強化します。

- 強化前
  - 検索キーワードに「課題番号」を入力しても、検索できない
- 強化後
  - 検索キーワードに「課題番号」を入力すると、検索できる

## やること

次の機能を持つChrome拡張機能を作成してください。

- Backlogサービスを対象とする
  - `*.backlog.com/*`
  - `*.backlog.jp/*`
- 検索キーワードに課題番号を入力したとき、目的の課題番号を開くボタンを検索ボックスの左側に表示する
  - 入力例
    - 1
    - 26
    - 205
- 課題番号が未入力の場合は、ボタンを表示しないこと
- 課題番号が0の場合は、ボタンを表示しないこと

### 検索ボックス

```html
<input type="search" class="search-box__input" role="search" placeholder="全体からキーワード検索" value="" id="globalSearch" name="searchProject" autocomplete="off" data-backlog-enhanced="true">
```

### 課題のURLのフォーマット

BacklogのURLをベースにする。

- BacklogのURL
  - https://xxx.backlog.com/projects/yyy
  - https://xxx.backlog.com/find/yyyy
  - https://xxx.backlog.com/board/yyyy

- 課題のURL
  - https://xxx.backlog.com/view/yyy-{number}
    - {number}は、課題の番号

### 目的の課題番号を開くボタン

- 2つのボタンを作成する
  - 同タブで開く
  - 別タブで開く

### リンク先の課題が存在しない場合

- ボタンを表示しないこと
- 代わりに「課題が存在しません」メッセージを表示すること

### ディレクトリ

- src
