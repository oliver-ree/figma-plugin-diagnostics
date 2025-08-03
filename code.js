// JSON Attribute Inspector Plugin
// This plugin allows you to paste JSON data and inspect its attributes

console.log("JSON Attribute Inspector starting...");

// Show the UI
figma.showUI(__html__, { width: 460, height: 750 });

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
  }
  
  if (msg.type === 'get-selection') {
    sendCurrentSelection();
  }
  
  if (msg.type === 'apply-mapping') {
    applyAttributeToLayer(msg.attribute, msg.property, msg.layer);
  }
  
  if (msg.type === 'get-components') {
    sendAvailableComponents();
  }
  
  if (msg.type === 'get-component-properties') {
    sendComponentProperties(msg.componentId);
  }
  
  if (msg.type === 'apply-component-mapping') {
    applyAttributeToComponent(msg.attribute, msg.componentId, msg.property);
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

// Send current selection info to UI
function sendCurrentSelection() {
  const selection = figma.currentPage.selection;
  
  if (selection.length === 0) {
    figma.ui.postMessage({
      type: 'layer-selection',
      layer: null
    });
    return;
  }
  
  // Use the first selected item
  const selectedNode = selection[0];
  const layerInfo = {
    id: selectedNode.id,
    name: selectedNode.name,
    type: selectedNode.type,
    width: selectedNode.width || 0,
    height: selectedNode.height || 0,
    x: selectedNode.x || 0,
    y: selectedNode.y || 0
  };
  
  figma.ui.postMessage({
    type: 'layer-selection',
    layer: layerInfo
  });
}

// Apply attribute value to layer property
async function applyAttributeToLayer(attribute, property, layerInfo) {
  const layer = figma.getNodeById(layerInfo.id);
  
  if (!layer) {
    figma.notify("❌ Layer not found");
    return;
  }
  
  const value = attribute.value;
  
  try {
    switch (property) {
      case 'text':
        if (layer.type === 'TEXT') {
          await figma.loadFont({ family: "Inter", style: "Regular" });
          layer.characters = String(value);
          figma.notify(`✅ Set text to: "${value}"`);
        } else {
          figma.notify("❌ Selected layer is not a text layer");
        }
        break;
        
      case 'fill':
        if (typeof value === 'string' && value.startsWith('#')) {
          const color = hexToRgb(value);
          if (color) {
            layer.fills = [{type: 'SOLID', color: color}];
            figma.notify(`✅ Set fill color to: ${value}`);
          } else {
            figma.notify("❌ Invalid hex color format");
          }
        } else {
          figma.notify("❌ Value must be a hex color (e.g., #FF0000)");
        }
        break;
        
      case 'width':
        if (typeof value === 'number' && value > 0) {
          layer.resize(value, layer.height);
          figma.notify(`✅ Set width to: ${value}px`);
        } else {
          figma.notify("❌ Width must be a positive number");
        }
        break;
        
      case 'height':
        if (typeof value === 'number' && value > 0) {
          layer.resize(layer.width, value);
          figma.notify(`✅ Set height to: ${value}px`);
        } else {
          figma.notify("❌ Height must be a positive number");
        }
        break;
        
      case 'x':
        if (typeof value === 'number') {
          layer.x = value;
          figma.notify(`✅ Set X position to: ${value}`);
        } else {
          figma.notify("❌ X position must be a number");
        }
        break;
        
      case 'y':
        if (typeof value === 'number') {
          layer.y = value;
          figma.notify(`✅ Set Y position to: ${value}`);
        } else {
          figma.notify("❌ Y position must be a number");
        }
        break;
        
      case 'opacity':
        if (typeof value === 'number' && value >= 0 && value <= 1) {
          layer.opacity = value;
          figma.notify(`✅ Set opacity to: ${value}`);
        } else {
          figma.notify("❌ Opacity must be a number between 0 and 1");
        }
        break;
        
      case 'rotation':
        if (typeof value === 'number') {
          layer.rotation = value * (Math.PI / 180); // Convert degrees to radians
          figma.notify(`✅ Set rotation to: ${value}°`);
        } else {
          figma.notify("❌ Rotation must be a number (degrees)");
        }
        break;
        
      case 'name':
        layer.name = String(value);
        figma.notify(`✅ Set layer name to: "${value}"`);
        break;
        
      default:
        figma.notify("❌ Unknown property type");
    }
    
    // Update selection to show changes
    figma.currentPage.selection = [layer];
    figma.viewport.scrollAndZoomIntoView([layer]);
    
  } catch (error) {
    console.error("Error applying mapping:", error);
    figma.notify(`❌ Error: ${error.message}`);
  }
}

// Helper function to convert hex color to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : null;
}

// Send available components to UI
function sendAvailableComponents() {
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

// Send component properties to UI
function sendComponentProperties(componentId) {
  const component = figma.getNodeById(componentId);
  
  if (!component || component.type !== "COMPONENT") {
    figma.notify("❌ Component not found");
    return;
  }
  
  try {
    const properties = [];
    
    // Get component property definitions
    if (component.componentPropertyDefinitions) {
      Object.keys(component.componentPropertyDefinitions).forEach(propName => {
        const propDef = component.componentPropertyDefinitions[propName];
        properties.push({
          name: propName,
          type: propDef.type,
          defaultValue: propDef.defaultValue
        });
      });
    }
    
    // Also add text layers as potential targets
    const textNodes = component.findAll(node => node.type === "TEXT");
    textNodes.forEach(textNode => {
      properties.push({
        name: `text:${textNode.name}`,
        type: "TEXT",
        defaultValue: textNode.characters
      });
    });
    
    figma.ui.postMessage({
      type: 'component-properties',
      properties: properties
    });
    
  } catch (error) {
    console.error("Error getting component properties:", error);
    figma.notify("❌ Error getting component properties");
  }
}

// Apply attribute to component property
async function applyAttributeToComponent(attribute, componentId, property) {
  const component = figma.getNodeById(componentId);
  
  if (!component || component.type !== "COMPONENT") {
    figma.notify("❌ Component not found");
    return;
  }
  
  const value = attribute.value;
  
  try {
    // Handle text node properties
    if (property.startsWith('text:')) {
      const textNodeName = property.replace('text:', '');
      const textNode = component.findOne(node => node.type === "TEXT" && node.name === textNodeName);
      
      if (textNode) {
        await figma.loadFont({ family: "Inter", style: "Regular" });
        textNode.characters = String(value);
        figma.notify(`✅ Set ${textNodeName} text to: "${value}"`);
      } else {
        figma.notify("❌ Text node not found");
      }
      return;
    }
    
    // Handle component properties
    if (component.componentPropertyDefinitions && component.componentPropertyDefinitions[property]) {
      const propDef = component.componentPropertyDefinitions[property];
      
      switch (propDef.type) {
        case 'TEXT':
          component.componentPropertyDefinitions[property].defaultValue = String(value);
          figma.notify(`✅ Set component property ${property} to: "${value}"`);
          break;
          
        case 'BOOLEAN':
          if (typeof value === 'boolean') {
            component.componentPropertyDefinitions[property].defaultValue = value;
            figma.notify(`✅ Set component property ${property} to: ${value}`);
          } else {
            figma.notify("❌ Value must be true or false for boolean properties");
          }
          break;
          
        case 'INSTANCE_SWAP':
          figma.notify("⚠️ Instance swap properties not yet supported");
          break;
          
        case 'VARIANT':
          component.componentPropertyDefinitions[property].defaultValue = String(value);
          figma.notify(`✅ Set variant property ${property} to: "${value}"`);
          break;
          
        default:
          figma.notify("❌ Unsupported property type");
      }
    } else {
      figma.notify("❌ Component property not found");
    }
    
    // Select the component to show changes
    figma.currentPage.selection = [component];
    figma.viewport.scrollAndZoomIntoView([component]);
    
  } catch (error) {
    console.error("Error applying component mapping:", error);
    figma.notify(`❌ Error: ${error.message}`);
  }
}

// Listen for selection changes
figma.on('selectionchange', () => {
  sendCurrentSelection();
});

// Optional: Log when plugin is ready
console.log("Plugin ready - paste JSON data to begin inspection");