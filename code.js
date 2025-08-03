// JSON Attribute Inspector Plugin
// This plugin allows you to paste JSON data and inspect its attributes

console.log("JSON Attribute Inspector starting...");

// Show the UI
figma.showUI(__html__, { width: 380, height: 500 });

// Store the current JSON data and selected attribute
let currentJsonData = null;
let selectedAttribute = null;

// Handle messages from the UI
figma.ui.onmessage = msg => {
  console.log("Received message:", msg.type);
  
  if (msg.type === 'attribute-selected') {
    selectedAttribute = msg.attribute;
    console.log("Selected attribute:", selectedAttribute);
    
    // Provide feedback about the selected attribute
    figma.notify(`📋 Selected: ${selectedAttribute.path} = ${JSON.stringify(selectedAttribute.value)}`);
    
    // You could add more functionality here, such as:
    // - Creating text nodes with the attribute value
    // - Storing the attribute for later use
    // - Applying the attribute to selected objects
  }
  
  if (msg.type === 'create-text-node') {
    if (selectedAttribute) {
      createTextNodeWithAttribute();
    } else {
      figma.notify("❌ No attribute selected");
    }
  }
  
  if (msg.type === 'close-plugin') {
    figma.closePlugin();
  }
};

// Function to create a text node with the selected attribute
async function createTextNodeWithAttribute() {
  if (!selectedAttribute) {
    figma.notify("❌ No attribute selected");
    return;
  }
  
  try {
    // Load the default font
    await figma.loadFont({ family: "Inter", style: "Regular" });
    
    // Create a text node
    const textNode = figma.createText();
    textNode.characters = `${selectedAttribute.path}: ${JSON.stringify(selectedAttribute.value)}`;
    textNode.fontSize = 14;
    textNode.fills = [{type: 'SOLID', color: {r: 0, g: 0, b: 0}}];
    
    // Position the text node
    textNode.x = 100;
    textNode.y = 100;
    
    // Add to current page
    figma.currentPage.appendChild(textNode);
    
    // Select the text node
    figma.currentPage.selection = [textNode];
    figma.viewport.scrollAndZoomIntoView([textNode]);
    
    figma.notify(`✅ Created text node: ${selectedAttribute.path}`);
    
  } catch (error) {
    console.error("Error creating text node:", error);
    figma.notify("❌ Error creating text node");
  }
}

// Optional: Log when plugin is ready
console.log("Plugin ready - paste JSON data to begin inspection");