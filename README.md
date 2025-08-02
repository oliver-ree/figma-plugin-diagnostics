# My Figma Plugin

A basic Figma plugin that creates rectangles.

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
2. Click "Create Rectangle" to add an orange rectangle to your canvas