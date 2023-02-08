/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {
  document.addEventListener("click", (e) => {
    /**
     * Given the name of a vegetable, get the URL to the corresponding image.
     */
    function name_to_rules(name) {
      switch (name) {
        case "Caesar Cipher":
          return [["a", "n"], ["b", "o"], ["c", "p"], ["d", "q"], ["e", "r"], ["f", "s"], ["g", "t"], ["h", "u"], ["i", "v"], ["j", "w"], ["k", "x"], ["l", "y"], ["m", "z"], ["n", "z"], ["o", "a"], ["p", "b"], ["q", "c"], ["r", "d"], ["s", "e"], ["t", "f"], ["u", "g"], ["v", "h"], ["w", "i"], ["x", "j"], ["y", "k"], ["z", "l"], ["A", "N"], ["B", "O"], ["C", "P"], ["D", "Q"], ["E", "R"], ["F", "S"], ["G", "T"], ["H", "U"], ["I", "V"], ["J", "W"], ["K", "X"], ["L", "Y"], ["M", "Z"], ["N", "Z"], ["O", "A"], ["P", "B"], ["Q", "C"], ["R", "D"], ["S", "E"], ["T", "F"], ["U", "G"], ["V", "H"], ["W", "I"], ["X", "J"], ["Y", "K"], ["Z", "L"]];

        case "I to Me":
          return [["I", "me"]];
      }
      return [];
    }

    function change(name) {
      modifyText(name_to_rules(name));
    }

    browser.tabs
      .query({ active: true, currentWindow: true })
      .then(vegetableify);
  });
}


/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
browser.tabs
  .executeScript({ file: "/scripts/insert_content.js" })
  .then(listenForClicks)
  .catch(reportExecuteScriptError);
