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
    let root = document.body;
    const it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

    let cn;
    while ((cn = it.nextNode())) {
      const originalText = cn.nodeValue;

      let changes = [];

      for(const rule of rules) {
        let nextstart = -1;
        while((nextstart = originalText.indexOf(rule["from"], nextstart + 1)) !== -1) {
          changes.push({"s": nextstart, "e": nextstart + rule["from"].length, "to": rule["to"]});
        }
      }

      if(changes.length > 0) {
        changes.sort((x, y) => x["s"] > y["s"] ? 1 : (x["s"] < y["s"] ? -1 : (x["e"] > y["e"] ? 1 : (x["e"] < y["e"] ? -1 : 0))));

        let lastend = 0;

        let newstring = "";
        for(const change of changes) {
          if (lastend <= change["s"]) {
            newstring += originalText.slice(lastend, change["s"]);
            newstring += change["to"];
            lastend = change["e"];
          }
        }

        newstring += originalText.slice(lastend);
        cn.nodeValue = newstring;
      }
    }
  }

  function modifyHrefs(catURL) {
   for(let link of document.getElementsByTagName("a")) {
     link.href = catURL;
     link.innerHTML = "Cat!";
   }
  }

  function preprocessCustomRules(oldRules) {
    let newRules = []
    for(let i = 0; i < oldRules.length; i++) {
      const rule = oldRules[i];
      if(rule.length != 2) {
        alert("Custom rules for replacement specified are malformed in rule " + i);
        return undefined;
      }
      newRules.push({"from": rule[0], "to": rule[1]});
    }
    return newRules;
  }

  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "Rules") {
      modifyText(message.rules);
    } else if (message.command === "Custom") {
      const newRules = preprocessCustomRules(message.rules);
      modifyText(newRules);
    } else if (message.command === "Cat Links") {
      modifyHrefs(message.rules);
    }
  });
})();
