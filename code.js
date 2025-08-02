// Main plugin code for Figma Plugin Diagnostics
// This file holds the main code for the plugin and has access to the document.

console.log("Plugin starting...");

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 320, height: 240 });

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
  // Handle different message types from the UI
  if (msg.type === 'create-component') {
    // Create component directly
    const component = figma.createComponent();
    component.name = "Diagnostic Button Component";
    component.description = "A reusable button component created by the diagnostics plugin";
    component.resize(120, 40);
    component.x = 150;
    component.y = 100;
    
    // Set component background
    component.fills = [{
      type: 'SOLID', 
      color: {r: 0.094, g: 0.627, b: 0.984} // Figma blue
    }];
    
    // Add corner radius
    component.cornerRadius = 8;
    
    // Load font and create text
    figma.loadFont({ family: "Inter", style: "Regular" }).then(() => {
      // Create text for the button
      const text = figma.createText();
      text.name = "Button Text";
      text.characters = "Button";
      text.fontSize = 14;
      text.fills = [{type: 'SOLID', color: {r: 1, g: 1, b: 1}}]; // White text
      
      // Center the text in the component
      text.x = (120 - text.width) / 2;
      text.y = (40 - text.height) / 2;
      
      // Add text to component
      component.appendChild(text);
      
      // Add component to page
      figma.currentPage.appendChild(component);
      
      // Select the component
      figma.currentPage.selection = [component];
      figma.viewport.scrollAndZoomIntoView([component]);
      
      console.log("Created component:", component.name);
      figma.notify("✅ Component created successfully!");
    }).catch(() => {
      // Fallback if font loading fails - create without text
      figma.currentPage.appendChild(component);
      
      figma.currentPage.selection = [component];
      figma.viewport.scrollAndZoomIntoView([component]);
      
      console.log("Created component (no text):", component.name);
      figma.notify("✅ Component created (font load failed)");
    });
  }

  // Close the plugin
  figma.closePlugin();
};