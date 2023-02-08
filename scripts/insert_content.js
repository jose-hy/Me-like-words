(() => {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  /**
   * This function is the one that does the main work of our add-on
   * It finds every text node in the webpage
   * And it applies all of the rules (in the format of [from text, to text])
   * to the page, applying the rules according to which non-overlapping rules
   * appear first in the text.
   */
  function modifyText(rules) {
    let root = document.rootElement;
    const it = document.createNodeIterator(root, NodeFilter.SHOW_TEXT);

    modifySubText(document.documentElement, [{'from': 'I', 'to': 'Me'}]) 

    while (cn = it.nextNode()) {
      original_text = cn.nodeValue;

      let changes = [];

      for(const rule of rules) {
        let nextstart = -1;
        while(1) {
          nextstart = original_text.indexOf(rule['from'], nextstart + 1);
          if(nextstart == -1)
            break;
          changes.push({'s': nextstart, 'e': nextstart + rule['from'].length, 'to': rule['to']});
        }
      }
      console.log(changes);

      if(changes.length > 0) {
        changes.sort((x, y) => x['s'] > y['s'] ? 1 : (x['s'] < y['s'] ? -1 : (x['e'] > y['e'] ? 1 : (x['e'] < y['e'] ? -1 : 0))));

        let realchanges = [];

        let lastend = 0;

        let newstring = "";
        for(const change of changes) {
          if (lastend <= change['s']) {
            newstring += original_text.slice(lastend, change['s']);
            newstring += change['to'];
            lastend = change['e'];
          }
        }

        newstring += original_text.slice(lastend);
        cn.nodeValue = newstring;
      }
    }
  }
})();
