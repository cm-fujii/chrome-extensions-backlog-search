/**
 * Backlog検索機能強化スクリプト
 * 課題番号を検出して直接アクセスボタンを表示
 */

(function() {
  'use strict';

  let currentButtons = [];
  let debounceTimer = null;

  /**
   * 課題番号形式かどうかを判定
   * @param {string} text - 入力テキスト
   * @returns {boolean} 課題番号形式の場合true（0は除外）
   */
  function isIssueNumber(text) {
    const trimmed = text.trim();
    if (!/^\d+$/.test(trimmed)) {
      return false;
    }
    // 0の場合は課題番号として扱わない
    const number = parseInt(trimmed, 10);
    return number > 0;
  }

  /**
   * 現在のBacklogプロジェクトキーを取得
   * @returns {string|null} プロジェクトキー
   */
  function getProjectKey() {
    const url = window.location.href;
    const pathname = window.location.pathname;
    
    // URLパターンから抽出: /projects/XXX, /find/XXX, /board/XXX
    const projectMatch = pathname.match(/\/(projects|find|board)\/([^\/]+)/);
    if (projectMatch) {
      return projectMatch[2];
    }
    
    // 課題URLから抽出: /view/XXX-123
    const issueMatch = pathname.match(/\/view\/([^-]+)-\d+/);
    if (issueMatch) {
      return issueMatch[1];
    }
    
    return null;
  }

  /**
   * 課題URLを生成
   * @param {string} issueNumber - 課題番号
   * @returns {string} 課題URL
   */
  function generateIssueUrl(issueNumber) {
    const projectKey = getProjectKey();
    const baseUrl = window.location.origin;
    
    if (projectKey) {
      return `${baseUrl}/view/${projectKey}-${issueNumber}`;
    }
    
    return `${baseUrl}/FindIssue.action?issueKey=${issueNumber}`;
  }

  /**
   * 「課題を開く」ボタンを作成
   * @param {string} issueNumber - 課題番号
   * @param {boolean} newTab - 新しいタブで開くかどうか
   * @returns {HTMLElement} ボタン要素
   */
  function createIssueButton(issueNumber, newTab = false) {
    const button = document.createElement('button');
    button.className = newTab ? 'backlog-issue-quick-access-btn backlog-new-tab' : 'backlog-issue-quick-access-btn';
    button.textContent = newTab ? `#${issueNumber} を別タブで開く` : `#${issueNumber} を開く`;
    button.title = newTab ? `課題 #${issueNumber} を新しいタブで開く` : `課題 #${issueNumber} を現在のタブで開く`;
    
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const url = generateIssueUrl(issueNumber);
      
      if (newTab) {
        window.open(url, '_blank');
      } else {
        window.location.href = url;
      }
    });
    
    return button;
  }

  /**
   * 既存のボタンを削除
   */
  function removeExistingButtons() {
    currentButtons.forEach(button => {
      if (button && button.parentNode) {
        button.parentNode.removeChild(button);
      }
    });
    currentButtons = [];
  }

  /**
   * 検索ボックスにボタンを追加（左側に配置）
   * @param {HTMLElement} searchBox - 検索ボックス要素
   * @param {string} issueNumber - 課題番号
   */
  function addButtonsToSearchBox(searchBox, issueNumber) {
    removeExistingButtons();
    
    // 2つのボタンを作成（同タブ、別タブ）
    const sameTabButton = createIssueButton(issueNumber, false);
    const newTabButton = createIssueButton(issueNumber, true);
    
    const container = searchBox.parentElement;
    
    // 検索ボックスの左側にボタンコンテナを配置
    let buttonContainer = container.querySelector('.backlog-issue-button-container');
    if (!buttonContainer) {
      buttonContainer = document.createElement('div');
      buttonContainer.className = 'backlog-issue-button-container';
      
      // 検索ボックスの前に挿入（左側配置）
      container.insertBefore(buttonContainer, searchBox);
      
      // 親コンテナをフレックスボックスにして横並びにする
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.gap = '8px';
    }
    
    // ボタンをグループ化して追加
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'backlog-button-group';
    buttonGroup.appendChild(sameTabButton);
    buttonGroup.appendChild(newTabButton);
    
    buttonContainer.appendChild(buttonGroup);
    currentButtons = [sameTabButton, newTabButton];
  }

  /**
   * 検索ボックスの入力を処理
   * @param {HTMLElement} searchBox - 検索ボックス要素
   */
  function handleSearchInput(searchBox) {
    clearTimeout(debounceTimer);
    
    debounceTimer = setTimeout(() => {
      const value = searchBox.value || searchBox.textContent || '';
      
      if (isIssueNumber(value)) {
        addButtonsToSearchBox(searchBox, value.trim());
      } else {
        removeExistingButtons();
      }
    }, 300);
  }

  /**
   * 検索ボックスを監視
   */
  function observeSearchBoxes() {
    const selectors = [
      'input#globalSearch',
      'input.search-box__input',
      'input[name="searchProject"]',
      'input[type="search"]',
      'input[type="text"][placeholder*="検索"]',
      'input[type="text"][placeholder*="Search"]',
      'input[type="text"][placeholder*="search"]',
      'input#q',
      'input[name="q"]',
      'input.search-input',
      'input.keyword-input',
      'input#keyword',
      '.search-box input',
      '.global-search input'
    ];
    
    selectors.forEach(selector => {
      const searchBoxes = document.querySelectorAll(selector);
      searchBoxes.forEach(searchBox => {
        if (!searchBox.hasAttribute('data-backlog-enhanced')) {
          searchBox.setAttribute('data-backlog-enhanced', 'true');
          
          searchBox.addEventListener('input', () => handleSearchInput(searchBox));
          searchBox.addEventListener('keyup', () => handleSearchInput(searchBox));
          searchBox.addEventListener('paste', () => {
            setTimeout(() => handleSearchInput(searchBox), 100);
          });
          
          if (searchBox.value) {
            handleSearchInput(searchBox);
          }
        }
      });
    });
  }

  /**
   * DOMの変更を監視
   */
  function observeDOM() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          setTimeout(observeSearchBoxes, 100);
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * 初期化
   */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    
    observeSearchBoxes();
    observeDOM();
    
    setInterval(observeSearchBoxes, 2000);
  }

  init();
})();