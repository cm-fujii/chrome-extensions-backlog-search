/**
 * Backlog検索機能強化スクリプト
 * 課題番号を検出して直接アクセスボタンを表示
 */

(function() {
  'use strict';

  let currentButton = null;
  let debounceTimer = null;

  /**
   * 課題番号形式かどうかを判定
   * @param {string} text - 入力テキスト
   * @returns {boolean} 課題番号形式の場合true
   */
  function isIssueNumber(text) {
    return /^\d+$/.test(text.trim());
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
   * @returns {HTMLElement} ボタン要素
   */
  function createIssueButton(issueNumber) {
    const button = document.createElement('button');
    button.className = 'backlog-issue-quick-access-btn';
    button.textContent = `課題 #${issueNumber} を開く`;
    
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const url = generateIssueUrl(issueNumber);
      window.location.href = url;
    });
    
    return button;
  }

  /**
   * 既存のボタンを削除
   */
  function removeExistingButton() {
    if (currentButton && currentButton.parentNode) {
      currentButton.parentNode.removeChild(currentButton);
      currentButton = null;
    }
  }

  /**
   * 検索ボックスにボタンを追加（左側に配置）
   * @param {HTMLElement} searchBox - 検索ボックス要素
   * @param {string} issueNumber - 課題番号
   */
  function addButtonToSearchBox(searchBox, issueNumber) {
    removeExistingButton();
    
    const button = createIssueButton(issueNumber);
    const container = searchBox.parentElement;
    
    // 検索ボックスの左側にボタンを配置
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
    
    buttonContainer.appendChild(button);
    currentButton = button;
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
        addButtonToSearchBox(searchBox, value.trim());
      } else {
        removeExistingButton();
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