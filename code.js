// JSON Attribute Inspector Plugin
// This plugin allows you to paste JSON data and inspect its attributes

console.log("JSON Attribute Inspector starting...");

// Show the UI
figma.showUI(__html__, { width: 600, height: 700 });

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
  
  if (msg.type === 'apply-all-component-mappings') {
    applyAllComponentMappings(msg.mappings);
  }
  
  if (msg.type === 'create-batch-components') {
    createBatchComponents(msg.componentId, msg.mappings, msg.arrayLength, msg.attributePaths);
  }
  
  if (msg.type === 'apply-hierarchical-mapping') {
    applyHierarchicalMapping(msg.componentId, msg.componentMappings, msg.nestedComponentMappings, msg.arrayLength, msg.attributePaths);
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
  
  if (msg.type === 'save-mapping') {
    console.log('Received save-mapping message:', msg.mapping);
    saveMappingToStorage(msg.mapping);
  }
  
  if (msg.type === 'get-saved-mappings') {
    getSavedMappings();
  }
  
  if (msg.type === 'delete-mapping') {
    deleteMappingFromStorage(msg.mappingId);
  }
};

// Save mapping to Figma clientStorage
async function saveMappingToStorage(mapping) {
  console.log('Starting saveMappingToStorage with:', mapping);
  try {
    console.log('Getting existing mappings...');
    // Get existing mappings
    const existingMappings = await figma.clientStorage.getAsync('component-mappings') || {};
    console.log('Existing mappings:', existingMappings);
    
    // Add the new mapping
    existingMappings[mapping.id] = mapping;
    console.log('Updated mappings:', existingMappings);
    
    console.log('Saving to clientStorage...');
    // Save back to storage
    await figma.clientStorage.setAsync('component-mappings', existingMappings);
    console.log('Successfully saved to clientStorage');
    
    // Send success message to UI
    console.log('Sending success message to UI...');
    figma.ui.postMessage({
      type: 'mapping-saved',
      name: mapping.name
    });
    
    console.log(`Mapping "${mapping.name}" saved successfully`);
    figma.notify(`✅ Mapping "${mapping.name}" saved!`);
  } catch (error) {
    console.error('Error saving mapping:', error);
    figma.notify('❌ Failed to save mapping');
  }
}

// Get saved mappings from Figma clientStorage
async function getSavedMappings() {
  try {
    const savedMappings = await figma.clientStorage.getAsync('component-mappings') || {};
    
    // Send mappings to UI
    figma.ui.postMessage({
      type: 'saved-mappings',
      mappings: savedMappings
    });
    
    console.log('Sent saved mappings to UI', Object.keys(savedMappings).length, 'mappings');
  } catch (error) {
    console.error('Error getting saved mappings:', error);
    figma.notify('❌ Failed to load saved mappings');
  }
}

// Delete mapping from Figma clientStorage
async function deleteMappingFromStorage(mappingId) {
  try {
    // Get existing mappings
    const existingMappings = await figma.clientStorage.getAsync('component-mappings') || {};
    
    // Delete the specified mapping
    delete existingMappings[mappingId];
    
    // Save back to storage
    await figma.clientStorage.setAsync('component-mappings', existingMappings);
    
    // Send success message to UI
    figma.ui.postMessage({
      type: 'mapping-deleted'
    });
    
    console.log(`Mapping ${mappingId} deleted successfully`);
  } catch (error) {
    console.error('Error deleting mapping:', error);
    figma.notify('❌ Failed to delete mapping');
  }
}

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
    const nestedComponents = [];
    
    // Get component property definitions
    if (component.componentPropertyDefinitions) {
      Object.keys(component.componentPropertyDefinitions).forEach(propName => {
        const propDef = component.componentPropertyDefinitions[propName];
        
        // Clean up property name by removing internal IDs (e.g., "title#18:2" → "title")
        const cleanName = propName.split('#')[0];
        
        properties.push({
          name: cleanName,
          originalName: propName, // Keep original for backend mapping
          type: propDef.type,
          defaultValue: propDef.defaultValue
        });
      });
    }
    
    // Find nested component instances with error handling
    const nestedComponentGroups = {};
    
    try {
      const componentInstances = component.findAll(node => node.type === "INSTANCE");
      
      componentInstances.forEach(instance => {
        try {
          const mainComponent = instance.mainComponent;
          if (mainComponent && mainComponent.type === "COMPONENT") {
            const componentName = mainComponent.name || "Unnamed Component";
            const componentId = mainComponent.id;
            
            if (!nestedComponentGroups[componentId]) {
              nestedComponentGroups[componentId] = {
                id: componentId,
                name: componentName,
                instances: [],
                properties: []
              };
              
              // Get properties of the nested component with safety checks
              try {
                if (mainComponent.componentPropertyDefinitions) {
                  Object.keys(mainComponent.componentPropertyDefinitions).forEach(propName => {
                    try {
                      const propDef = mainComponent.componentPropertyDefinitions[propName];
                      if (propDef && propDef.type) {
                        const cleanName = propName.split('#')[0];
                        
                        nestedComponentGroups[componentId].properties.push({
                          name: cleanName,
                          originalName: propName,
                          type: propDef.type,
                          defaultValue: propDef.defaultValue || null
                        });
                      }
                    } catch (propError) {
                      console.warn(`Error processing property ${propName}:`, propError);
                    }
                  });
                }
              } catch (propDefError) {
                console.warn(`Error accessing component property definitions for ${componentName}:`, propDefError);
              }
            }
            
            nestedComponentGroups[componentId].instances.push({
              id: instance.id,
              name: instance.name || "Unnamed Instance"
            });
          }
        } catch (instanceError) {
          console.warn("Error processing nested component instance:", instanceError);
        }
      });
    } catch (findAllError) {
      console.warn("Error finding nested components:", findAllError);
      // Continue execution without nested components
    }
    
    // Convert to array
    Object.values(nestedComponentGroups).forEach(group => {
      nestedComponents.push(group);
    });
    
    console.log(`✅ Found ${properties.length} properties and ${nestedComponents.length} nested component types`);
    
    // Send successful response even if there were minor errors in nested component detection
    figma.ui.postMessage({
      type: 'component-properties',
      properties: properties,
      nestedComponents: nestedComponents
    });
    
  } catch (error) {
    console.error("❌ Critical error getting component properties:", error);
    figma.notify(`❌ Error getting component properties: ${error.message}`);
    
    // Send fallback response with just the basic properties
    try {
      figma.ui.postMessage({
        type: 'component-properties', 
        properties: properties || [],
        nestedComponents: []
      });
    } catch (fallbackError) {
      console.error("❌ Failed to send fallback response:", fallbackError);
    }
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
      
      // Find text node within the component using the correct API
      const textNodes = component.findAll(node => node.type === "TEXT");
      const textNode = textNodes.find(node => node.name === textNodeName);
      
      if (textNode) {
        await figma.loadFont({ family: "Inter", style: "Regular" });
        textNode.characters = String(value);
        figma.notify(`✅ Set ${textNodeName} text to: "${value}"`);
      } else {
        figma.notify(`❌ Text node "${textNodeName}" not found`);
      }
      return;
    }
    
    // Handle component properties - create an instance to modify
    if (component.componentPropertyDefinitions && component.componentPropertyDefinitions[property]) {
      const propDef = component.componentPropertyDefinitions[property];
      
      // Create an instance of the component to modify its properties
      const instance = component.createInstance();
      instance.x = 150;
      instance.y = 100;
      figma.currentPage.appendChild(instance);
      
      switch (propDef.type) {
        case 'TEXT':
          instance.setProperties({
            [property]: String(value)
          });
          figma.notify(`✅ Created instance with ${property} = "${value}"`);
          break;
          
        case 'BOOLEAN':
          if (typeof value === 'boolean') {
            instance.setProperties({
              [property]: value
            });
            figma.notify(`✅ Created instance with ${property} = ${value}`);
          } else {
            figma.notify("❌ Value must be true or false for boolean properties");
          }
          break;
          
        case 'INSTANCE_SWAP':
          figma.notify("⚠️ Instance swap properties not yet supported");
          break;
          
        case 'VARIANT':
          instance.setProperties({
            [property]: String(value)
          });
          figma.notify(`✅ Created instance with variant ${property} = "${value}"`);
          break;
          
        default:
          figma.notify("❌ Unsupported property type");
      }
      
      // Select the instance to show changes
      figma.currentPage.selection = [instance];
      figma.viewport.scrollAndZoomIntoView([instance]);
      
    } else {
      figma.notify(`❌ Component property "${property}" not found`);
    }
    
  } catch (error) {
    console.error("Error applying component mapping:", error);
    figma.notify(`❌ Error: ${error.message}`);
  }
}

// Apply multiple mappings to create a single component instance
async function applyAllComponentMappings(mappings) {
  if (!mappings || mappings.length === 0) {
    figma.notify("❌ No mappings provided");
    return;
  }
  
  // Group mappings by component
  const componentGroups = {};
  mappings.forEach(mapping => {
    if (!componentGroups[mapping.componentId]) {
      componentGroups[mapping.componentId] = [];
    }
    componentGroups[mapping.componentId].push(mapping);
  });
  
  // Process each component group
  for (const [componentId, componentMappings] of Object.entries(componentGroups)) {
    const component = figma.getNodeById(componentId);
    
    if (!component || component.type !== "COMPONENT") {
      figma.notify(`❌ Component not found: ${componentId}`);
      continue;
    }
    
    try {
      // Create an instance of the component
      const instance = component.createInstance();
      instance.x = 150;
      instance.y = 100;
      figma.currentPage.appendChild(instance);
      
      // Apply all mappings to this instance
      const properties = {};
      const textUpdates = [];
      
      for (const mapping of componentMappings) {
        const value = mapping.attribute.value;
        const propertyName = mapping.property.name;
        
        // Handle text node properties
        if (propertyName.startsWith('text:')) {
          const textNodeName = propertyName.replace('text:', '');
          textUpdates.push({ nodeName: textNodeName, value: String(value) });
        } else {
          // Handle component properties
          if (component.componentPropertyDefinitions && component.componentPropertyDefinitions[propertyName]) {
            const propDef = component.componentPropertyDefinitions[propertyName];
            
            switch (propDef.type) {
              case 'TEXT':
                properties[propertyName] = String(value);
                break;
              case 'BOOLEAN':
                if (typeof value === 'boolean') {
                  properties[propertyName] = value;
                } else {
                  console.warn(`Boolean property ${propertyName} received non-boolean value:`, value);
                }
                break;
              case 'VARIANT':
                properties[propertyName] = String(value);
                break;
              case 'INSTANCE_SWAP':
                console.warn(`Instance swap property ${propertyName} not yet supported`);
                break;
            }
          }
        }
      }
      
      // Apply component properties if any
      if (Object.keys(properties).length > 0) {
        instance.setProperties(properties);
      }
      
      // Apply text node updates if any
      if (textUpdates.length > 0) {
        await figma.loadFont({ family: "Inter", style: "Regular" });
        
        for (const textUpdate of textUpdates) {
          const textNodes = instance.findAll(node => node.type === "TEXT");
          const textNode = textNodes.find(node => node.name === textUpdate.nodeName);
          
          if (textNode) {
            textNode.characters = textUpdate.value;
          } else {
            console.warn(`Text node "${textUpdate.nodeName}" not found in component instance`);
          }
        }
      }
      
      // Select the instance to show changes
      figma.currentPage.selection = [instance];
      figma.viewport.scrollAndZoomIntoView([instance]);
      
      const mappingCount = componentMappings.length;
      figma.notify(`✅ Created ${component.name} instance with ${mappingCount} mapping${mappingCount > 1 ? 's' : ''} applied`);
      
    } catch (error) {
      console.error("Error applying mappings to component:", error);
      figma.notify(`❌ Error applying mappings to ${component.name}: ${error.message}`);
    }
  }
}

// Listen for selection changes
figma.on('selectionchange', () => {
  sendCurrentSelection();
});

// Create multiple component instances from array data
async function createBatchComponents(componentId, mappings, arrayLength, attributePaths) {
  const component = figma.getNodeById(componentId);
  
  if (!component || component.type !== "COMPONENT") {
    figma.notify("❌ Component not found");
    return;
  }
  
  if (!arrayLength || arrayLength === 0) {
    figma.notify("❌ No array items found");
    return;
  }
  
  try {
    
    const instances = [];
    
    // Create one instance for each array item
    for (let i = 0; i < arrayLength; i++) {
      const instance = component.createInstance();
      instance.x = 150 + (i * 320); // Space them out horizontally
      instance.y = 100;
      figma.currentPage.appendChild(instance);
      
      const properties = {};
      const textUpdates = [];
      
      // Apply mappings for this specific array index
      for (const [propertyName, mapping] of Object.entries(mappings)) {
        if (mapping.path && mapping.path.includes('[*]')) {
          // Convert pattern to specific index
          const actualPath = mapping.path.replace('[*]', `[${i}]`);
          
          // Find the actual value from the attributePaths data
          const actualAttribute = attributePaths.find(attr => attr.path === actualPath);
          const value = actualAttribute ? actualAttribute.value : `Item ${i + 1}`;
          
          if (propertyName.startsWith('text:')) {
            const textNodeName = propertyName.replace('text:', '');
            textUpdates.push({ nodeName: textNodeName, value: String(value) });
          } else {
            if (component.componentPropertyDefinitions && component.componentPropertyDefinitions[propertyName]) {
              const propDef = component.componentPropertyDefinitions[propertyName];
              
              switch (propDef.type) {
                case 'TEXT':
                  properties[propertyName] = String(value);
                  break;
                case 'BOOLEAN':
                  if (typeof value === 'boolean') {
                    properties[propertyName] = value;
                  }
                  break;
                case 'VARIANT':
                  properties[propertyName] = String(value);
                  break;
              }
            }
          }
        }
      }
      
      // Apply component properties
      if (Object.keys(properties).length > 0) {
        instance.setProperties(properties);
      }
      
      // Apply text updates
      if (textUpdates.length > 0) {
        await figma.loadFont({ family: "Inter", style: "Regular" });
        
        for (const textUpdate of textUpdates) {
          const textNodes = instance.findAll(node => node.type === "TEXT");
          const textNode = textNodes.find(node => node.name === textUpdate.nodeName);
          
          if (textNode) {
            textNode.characters = textUpdate.value;
          }
        }
      }
      
      instances.push(instance);
    }
    
    // Select all created instances
    figma.currentPage.selection = instances;
    figma.viewport.scrollAndZoomIntoView(instances);
    
    figma.notify(`✅ Created ${arrayLength} ${component.name} instances from array data`);
    
  } catch (error) {
    console.error("Error creating batch components:", error);
    figma.notify(`❌ Error creating batch components: ${error.message}`);
  }
}

// Apply hierarchical mapping with nested components
async function applyHierarchicalMapping(componentId, componentMappings, nestedComponentMappings, arrayLength, attributePaths) {
  const component = figma.getNodeById(componentId);
  
  if (!component || component.type !== "COMPONENT") {
    figma.notify("❌ Component not found");
    return;
  }
  
  try {
    console.log(`🚀 Hierarchical mapping: arrayLength=${arrayLength}, nestedMappings:`, Object.keys(nestedComponentMappings));
    
    if (arrayLength > 0) {
      // Create multiple instances with array data
      figma.notify(`Creating ${arrayLength} instances with nested component mapping...`);
      
      const instances = [];
      const gridCols = Math.min(5, Math.ceil(Math.sqrt(arrayLength)));
      const spacing = 350;
      
      for (let i = 0; i < arrayLength; i++) {
        const instance = component.createInstance();
        
        // Position in a grid
        const row = Math.floor(i / gridCols);
        const col = i % gridCols;
        instance.x = 150 + col * spacing;
        instance.y = 100 + row * spacing;
        
        figma.currentPage.appendChild(instance);
        instances.push(instance);
        
        // Apply main component mappings
        await applyMappingsToInstance(instance, component, componentMappings, i, attributePaths);
        
        // Apply nested component mappings
        await applyNestedComponentMappings(instance, nestedComponentMappings, i, attributePaths);
      }
      
      // Select all created instances
      figma.currentPage.selection = instances;
      figma.viewport.scrollAndZoomIntoView(instances);
      
      figma.notify(`✅ Created ${arrayLength} instances with nested components populated`);
      
    } else {
      // Create single instance with nested component array mapping
      console.log(`📦 Creating single instance with ${Object.keys(nestedComponentMappings).length} nested component types`);
      const instance = component.createInstance();
      instance.x = 150;
      instance.y = 100;
      figma.currentPage.appendChild(instance);
      
      // Apply main component mappings
      await applyMappingsToInstance(instance, component, componentMappings, 0, attributePaths);
      
      // Apply nested component mappings
      await applyNestedComponentMappings(instance, nestedComponentMappings, 0, attributePaths);
      
      figma.currentPage.selection = [instance];
      figma.viewport.scrollAndZoomIntoView([instance]);
      
      figma.notify("✅ Created component instance with nested components populated");
    }
    
  } catch (error) {
    console.error("Error in hierarchical mapping:", error);
    figma.notify(`❌ Error: ${error.message}`);
  }
}

// Apply mappings to a component instance
async function applyMappingsToInstance(instance, component, mappings, arrayIndex, attributePaths) {
  const properties = {};
  const textUpdates = [];
  
  for (const [propertyName, mapping] of Object.entries(mappings)) {
    const value = getValueForArrayIndex(mapping, arrayIndex, attributePaths);
    
    // Handle text node properties
    if (propertyName.startsWith('text:')) {
      const textNodeName = propertyName.replace('text:', '');
      textUpdates.push({ nodeName: textNodeName, value: String(value) });
    } else if (component.componentPropertyDefinitions && component.componentPropertyDefinitions[propertyName]) {
      // Handle component properties
      const propDef = component.componentPropertyDefinitions[propertyName];
      switch (propDef.type) {
        case 'TEXT':
        case 'VARIANT':
          properties[propertyName] = String(value);
          break;
        case 'BOOLEAN':
          properties[propertyName] = Boolean(value);
          break;
      }
    }
  }
  
  // Apply component properties
  if (Object.keys(properties).length > 0) {
    instance.setProperties(properties);
  }
  
  // Apply text updates
  if (textUpdates.length > 0) {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    for (const { nodeName, value } of textUpdates) {
      const textNodes = instance.findAll(node => node.type === "TEXT");
      const textNode = textNodes.find(node => node.name === nodeName);
      if (textNode) {
        textNode.characters = value;
      }
    }
  }
}

// Apply nested component mappings
async function applyNestedComponentMappings(parentInstance, nestedMappings, arrayIndex, attributePaths) {
  for (const [nestedComponentId, mappings] of Object.entries(nestedMappings)) {
    // Find all instances of this nested component within the parent
    const nestedInstances = parentInstance.findAll(node => 
      node.type === "INSTANCE" && 
      node.mainComponent && 
      node.mainComponent.id === nestedComponentId
    );
    
    // Apply mappings to each nested instance
    for (let instanceIndex = 0; instanceIndex < nestedInstances.length; instanceIndex++) {
      const nestedInstance = nestedInstances[instanceIndex];
      const nestedComponent = nestedInstance.mainComponent;
      
      if (nestedComponent) {
        const properties = {};
        const textUpdates = [];
        
        for (const [propertyName, mapping] of Object.entries(mappings)) {
          // For nested components: if parent is from array, use complex index; otherwise use instanceIndex directly
          let dataIndex;
          if (arrayIndex > 0) {
            // Multiple parent instances - each parent's nested components get offset data
            dataIndex = arrayIndex * nestedInstances.length + instanceIndex;
          } else {
            // Single parent instance - nested components map directly to array indices  
            dataIndex = instanceIndex;
          }
          
          const value = getValueForArrayIndex(mapping, dataIndex, attributePaths);
          
          console.log(`🔍 Nested mapping: ${propertyName} → index ${dataIndex} → "${value}"`);  // Debug log
          
          // Handle component properties
          if (nestedComponent.componentPropertyDefinitions && nestedComponent.componentPropertyDefinitions[propertyName]) {
            const propDef = nestedComponent.componentPropertyDefinitions[propertyName];
            switch (propDef.type) {
              case 'TEXT':
              case 'VARIANT':
                properties[propertyName] = String(value);
                break;
              case 'BOOLEAN':
                properties[propertyName] = Boolean(value);
                break;
            }
          }
        }
        
        // Apply properties to nested instance
        if (Object.keys(properties).length > 0) {
          nestedInstance.setProperties(properties);
        }
      }
    }
  }
}

// Get value for a specific array index
function getValueForArrayIndex(mapping, arrayIndex, attributePaths) {
  if (mapping.path && mapping.path.includes('[*]')) {
    // This is an array pattern - replace [*] with specific index
    const specificPath = mapping.path.replace('[*]', `[${arrayIndex}]`);
    const attribute = attributePaths.find(attr => attr.path === specificPath);
    return attribute ? attribute.value : mapping.value; // Fallback to sample value
  } else {
    // Regular single value
    return mapping.value;
  }
}

// Optional: Log when plugin is ready
console.log("Plugin ready - paste JSON data to begin inspection");