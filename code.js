// Main plugin code for Figma Plugin Diagnostics
// This file holds the main code for the plugin and has access to the document.

console.log("Plugin starting...");

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 300, height: 400 });

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
// Send available components to UI when plugin loads
function sendComponentsToUI() {
  // Find all components in the current file
  const components = figma.root.findAll(node => node.type === "COMPONENT");
  
  const componentList = components.map(comp => ({
    id: comp.id,
    name: comp.name,
    description: comp.description || "No description"
  }));
  
  figma.ui.postMessage({
    type: 'components-list',
    components: componentList
  });
}

// Send components list when plugin starts
sendComponentsToUI();

figma.ui.onmessage = msg => {
  if (msg.type === 'refresh-components') {
    sendComponentsToUI();
  }
  
  if (msg.type === 'create-instance') {
    const componentId = msg.componentId;
    
    // Find the component by ID
    const component = figma.getNodeById(componentId);
    
    if (component && component.type === "COMPONENT") {
      // Create an instance of the component
      const instance = component.createInstance();
      instance.x = 150;
      instance.y = 100;
      
      // Add instance to current page
      figma.currentPage.appendChild(instance);
      
      // Select the instance
      figma.currentPage.selection = [instance];
      figma.viewport.scrollAndZoomIntoView([instance]);
      
      console.log("Created instance of:", component.name);
      figma.notify(`✅ Created instance of "${component.name}"`);
    } else {
      figma.notify("❌ Component not found");
    }
  }

  // Close the plugin when done
  if (msg.type === 'close-plugin') {
    figma.closePlugin();
  }
};