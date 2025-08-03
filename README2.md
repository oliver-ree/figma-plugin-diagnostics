# JSON Attribute Inspector

A Figma plugin that allows you to paste JSON data and inspect all its attributes through an interactive dropdown interface.

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

## Files

- `manifest.json` - Plugin manifest and configuration
- `code.js` - Main plugin code that runs in Figma's sandbox
- `ui.html` - Plugin user interface
- `package.json` - Node.js dependencies and scripts

## Usage

1. Run the plugin in Figma
2. Paste your JSON data into the text area
3. Click "Apply JSON" to parse the data
4. Select any attribute from the dropdown menu
5. View detailed information about the selected attribute (path, value, type)
6. The plugin will show notifications when you select attributes

## Features

- **JSON Parsing**: Paste any valid JSON and see it parsed instantly
- **Deep Attribute Extraction**: Automatically finds all nested properties and array elements
- **Interactive Dropdown**: Browse all attributes with path notation (e.g., `user.address.city`)
- **Type Detection**: Shows whether each attribute is a string, number, object, array, etc.
- **Real-time Feedback**: Get instant notifications about your selections
- **Keyboard Shortcuts**: Use Cmd/Ctrl+Enter in the textarea to apply JSON quickly