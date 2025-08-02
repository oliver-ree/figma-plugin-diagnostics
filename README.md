# Figma Plugin Diagnostics

A Figma plugin that helps with diagnostics and testing by creating instances of existing components in your file.

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

1. Make sure you have components in your Figma file (create them manually first)
2. Run the plugin in Figma
3. The plugin will show a list of all available components in your file
4. Click on any component to create an instance of it on the canvas
5. Use the "Refresh List" button if you add new components while the plugin is open