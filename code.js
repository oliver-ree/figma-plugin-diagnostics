// This file holds the main code for the plugin.
// It has access to the *document*.
// You can access browser APIs such as the network by creating a UI
// which contains a full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === 'create-rectangle') {
    const rect = figma.createRectangle();
    rect.x = 150;
    rect.y = 100;
    rect.fills = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];
    figma.currentPage.appendChild(rect);
    figma.currentPage.selection = [rect];
    figma.viewport.scrollAndZoomIntoView([rect]);
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};