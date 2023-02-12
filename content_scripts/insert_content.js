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

    //loop over every text node in the document
    let cn;
    while ((cn = it.nextNode())) {
      const originalText = cn.nodeValue;

      let changes = [];

      //find the locations at which we have matches for the string we're trying to replace
      for(const rule of rules) {
        let nextstart = -1;
        while((nextstart = originalText.indexOf(rule["from"], nextstart + 1)) !== -1) {
          changes.push({"s": nextstart, "e": nextstart + rule["from"].length, "to": rule["to"]});
        }
      }

      //if there are any such places
      if(changes.length > 0) {
        //sort the changes such that the ones that come first in the string get applied first
        changes.sort((x, y) => x["s"] > y["s"] ? 1 : (x["s"] < y["s"] ? -1 : 0));

        let lastend = 0;

        let newstring = "";
        //apply the next nonoverlapping change iteratively until we run out of changes, adding the
        //non-replaced text in-between changes
        for(const change of changes) {
          if (lastend <= change["s"]) {
            newstring += originalText.slice(lastend, change["s"]);
            newstring += change["to"];
            lastend = change["e"];
          }
        }

        //add the rest of the text, and replace it in the node
        newstring += originalText.slice(lastend);
        cn.nodeValue = newstring;
      }
    }
  }

  function modifyHrefs(catURL) {
   //get every link in the document and replace it with the cat
   for(let link of document.getElementsByTagName("a")) {
     link.href = catURL;
     link.innerHTML = "Cat!";
   }
  }

  //turn the rules, passed in as a 2d array, into the array of dicts structure, alerting on failure
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

  //handle messages given from the popup
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
