# JSON Attribute Inspector

A Figma plugin that allows you to paste JSON data, inspect all its attributes through an interactive dropdown interface, and apply attribute values directly to selected layers on the canvas.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the plugin:
   ```bash
   npm run build
   ```

3. In Figma:
   - Go to Plugins → Development → Import plugin from manifest...
   - Select the `manifest.json` file from this directory
   - Run the plugin

## Usage

### Tab 1: Layer Mapping
1. Run the plugin in Figma
2. Paste your JSON data into the text area
3. Click "Apply JSON" to parse the data
4. Select any attribute from the categorized dropdown menu
5. Select a layer on the canvas (or create one)
6. Choose what layer property to apply the attribute to
7. Click "Apply to Layer" to execute the mapping

### Tab 2: Component Properties
1. Ensure you have JSON data loaded (from Tab 1)
2. Switch to "Component Properties" tab
3. Select an attribute from the dataset
4. Choose a component from your file
5. Select a component property to map to
6. Click "Apply Component Mapping" to execute

## Features

- **JSON Parsing**: Paste any valid JSON and see it parsed instantly
- **Smart Categorization**: Attributes organized by type with emojis and counts
  - 🏠 Root Level - Top-level properties
  - 📦 Objects - All object-type properties  
  - 📋 Arrays - All array-type properties
  - 🔢 Array Items - Individual array elements
  - 🌲 Nested Properties - Deep nested values
- **Deep Attribute Extraction**: Automatically finds all nested properties and array elements
- **Interactive Dropdown**: Browse all attributes with path notation (e.g., `user.address.city`)
- **Tabbed Interface**: Clean separation between layer mapping and component properties
- **Layer Mapping** (Tab 1): Apply JSON attributes directly to selected layers on canvas
  - 📝 Text Content
  - 🎨 Fill Color (hex)
  - 📏 Width/Height
  - ➡️ Position (X/Y)
  - 👻 Opacity
  - 🔄 Rotation
  - 🏷️ Layer Name
- **Component Property Mapping** (Tab 2): Map attributes to Figma component properties
  - Text properties
  - Boolean properties
  - Variant properties  
  - Text layer overrides
- **Real-time Preview**: See exactly what will be applied before executing
- **Auto-sync Selection**: Automatically detects when you select different layers
- **Statistics Dashboard**: View breakdown of object types in your JSON
- **Real-time Feedback**: Get instant notifications about your selections
- **Keyboard Shortcuts**: Use Cmd/Ctrl+Enter in the textarea to apply JSON quickly

## Example Workflow

1. **Paste sample JSON**:
   ```json
   {
     "user": {
       "name": "John Doe",
       "profile": { "age": 30, "theme": "#FF5733" }
     },
     "dimensions": { "width": 200, "height": 100 }
   }
   ```

2. **Apply and explore**: See attributes categorized and ready to use

3. **Select a text layer** on canvas and map `user.name` → Text Content

4. **Select a shape** and map `user.profile.theme` → Fill Color

5. **Resize elements** using `dimensions.width` → Width

## Files

- `manifest.json` - Plugin configuration
- `code.js` - Main plugin logic that runs in Figma's sandbox
- `ui.html` - User interface with JSON parser and layer mapping
- `package.json` - Dependencies and scripts

## Data-Driven Design

Perfect for:
- **Dynamic prototypes** with real data
- **Design system testing** with various content
- **Bulk content updates** from APIs or databases
- **A/B testing** with different configurations
- **Rapid iteration** with changing requirements