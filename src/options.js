/**
 * オプションページのスクリプト
 */

document.addEventListener('DOMContentLoaded', function() {
  const checkboxElement = document.getElementById('checkIssueExists');
  const saveStatusElement = document.getElementById('saveStatus');
  
  /**
   * 保存完了メッセージを表示
   */
  function showSaveStatus() {
    saveStatusElement.classList.add('show');
    setTimeout(() => {
      saveStatusElement.classList.remove('show');
    }, 2000);
  }
  
  /**
   * 設定を読み込み
   */
  chrome.storage.sync.get(['checkIssueExists'], function(result) {
    // デフォルトはON
    checkboxElement.checked = result.checkIssueExists !== false;
  });
  
  /**
   * 設定変更時に保存
   */
  checkboxElement.addEventListener('change', function() {
    chrome.storage.sync.set({
      checkIssueExists: checkboxElement.checked
    }, function() {
      showSaveStatus();
    });
  });
});