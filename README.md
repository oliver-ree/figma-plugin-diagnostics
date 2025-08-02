# Figma Plugin Diagnostics

A Figma plugin that creates reusable button components for diagnostics and testing.

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
2. Click "Create Component" to add a reusable button component to your canvas
3. The component will appear in your Assets panel for reuse across your design