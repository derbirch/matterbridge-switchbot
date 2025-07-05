# Matterbridge SwitchBot Plugin

A Matterbridge plugin that integrates SwitchBot devices with the Matter protocol, allowing you to control your SwitchBot devices through Matter-compatible smart home platforms like Apple HomeKit, Google Home, Amazon Alexa, and others.

## Features

- **Full SwitchBot API v1.1+ Support**: Uses the latest SwitchBot API with enhanced security
- **Wide Device Support**: Supports physical devices (Bot, Plug, Lights, Curtains) and infrared remote devices
- **Matter Protocol Integration**: Exposes SwitchBot devices as Matter-compatible devices
- **Real-time Status Updates**: Polls device status and updates Matter attributes accordingly
- **Secure Authentication**: Implements SwitchBot's HMAC-SHA256 signature authentication
- **UI Configuration**: Configure through Matterbridge's web interface
- **TypeScript**: Fully typed for better development experience

## Supported Devices

### Physical Devices
- **SwitchBot Bot**: Exposed as an on/off switch
- **SwitchBot Plug** (Mini US/JP, Standard): Exposed as outlets
- **SwitchBot Lights** (Color Bulb, Strip Light, Ceiling Light): Exposed as dimmable/color lights
- **SwitchBot Curtain/Roller Shade**: Exposed as on/off switches (open/close)

### Infrared Remote Devices
- **Air Conditioner**: Exposed as on/off switch
- **TV**: Exposed as on/off switch
- **Light**: Exposed as on/off switch
- **Fan**: Exposed as on/off switch

## Prerequisites

1. **Matterbridge**: Version 3.0.7 or higher
2. **SwitchBot Account**: With API access enabled
3. **SwitchBot Token and Secret**: Obtained from the SwitchBot app

## Installation

### Method 1: Install from npm (Recommended)

1. **Install the plugin**:
   ```bash
   npm install -g matterbridge-switchbot
   ```

2. **Add the plugin to Matterbridge**:
   - Open the Matterbridge web interface
   - Go to **Plugins** → **Add Plugin**
   - Search for "matterbridge-switchbot" or add it manually
   - Click **Install**

### Method 2: Install from source

1. **Clone this repository**:
   ```bash
   git clone https://github.com/derbirch/matterbridge-switchbot.git
   cd matterbridge-switchbot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the plugin**:
   ```bash
   npx tsc
   ```

4. **Link the plugin to your Matterbridge installation**:
   ```bash
   npm link
   ```

5. **Add the plugin to Matterbridge**:
   ```bash
   matterbridge -add /path/to/your/matterbridge-switchbot
   ```

## Configuration

### Getting SwitchBot API Credentials

1. Open the SwitchBot app on your mobile device
2. Go to **Profile** → **Preferences**
3. Tap **App Version** 10 times to enable developer options
4. Go back and tap **Developer Options**
5. Generate your **Token** and **Secret**

### Plugin Configuration

#### Via Matterbridge Web Interface (Recommended)

1. Open the Matterbridge web interface
2. Go to **Plugins** → **matterbridge-switchbot**
3. Click **Settings** or **Configure**
4. Fill in the configuration form:
   - **SwitchBot API Token**: Your SwitchBot API token
   - **SwitchBot API Secret**: Your SwitchBot API secret
   - **Polling Interval**: How often to check device status (default: 30 seconds)
   - **SwitchBot API Base URL**: API endpoint (default: https://api.switch-bot.com)
5. Click **Save**

#### Via Configuration File (Alternative)

Add the following configuration to your Matterbridge config file:

```json
{
  "name": "SwitchBot",
  "type": "DynamicPlatform",
  "token": "your-switchbot-token",
  "secret": "your-switchbot-secret",
  "baseUrl": "https://api.switch-bot.com",
  "pollInterval": 30
}
```

#### Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `token` | string | Yes | - | Your SwitchBot API token |
| `secret` | string | Yes | - | Your SwitchBot API secret |
| `baseUrl` | string | No | `https://api.switch-bot.com` | SwitchBot API base URL |
| `pollInterval` | number | No | 30 | Status polling interval in seconds (minimum: 5) |

## Usage

1. **Start Matterbridge**: The plugin will automatically discover your SwitchBot devices
2. **Device Registration**: Devices will be registered with Matter and appear in your smart home app
3. **Control Devices**: Use your Matter-compatible smart home platform to control devices
4. **Status Updates**: Device status is automatically synchronized based on the polling interval

## Device Mapping

### Physical Devices
- **Bot** → Matter On/Off Switch
- **Plug** → Matter Outlet
- **Color Bulb** → Matter Color Temperature Light (with brightness and color temperature control)
- **Strip Light** → Matter Color Temperature Light (with brightness control)
- **Ceiling Light** → Matter Color Temperature Light (with brightness and color temperature control)
- **Curtain/Roller Shade** → Matter On/Off Switch (open = on, close = off)

### Infrared Devices
- **All IR Devices** → Matter On/Off Switch (power on/off commands)

## API Reference

### SwitchBot API Integration

The plugin uses SwitchBot API v1.1 with the following endpoints:

- `GET /v1.1/devices` - Discover devices
- `GET /v1.1/devices/{deviceId}/status` - Get device status
- `POST /v1.1/devices/{deviceId}/commands` - Send device commands

### Authentication

The plugin implements SwitchBot's secure authentication using:
- HMAC-SHA256 signature generation
- Timestamp-based nonce
- Token and secret key validation

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/derbirch/matterbridge-switchbot.git
cd matterbridge-switchbot

# Install dependencies
npm install

# Build the project
npx tsc

# Run tests (if available)
npm test
```

### Project Structure

```
src/
├── module.ts              # Main plugin module
├── switchbot-api.ts       # SwitchBot API client
└── device-manager.ts      # Device discovery and management

matterbridge-switchbot.schema.json  # UI configuration schema
dist/                      # Compiled JavaScript output
```

### Testing

The plugin includes comprehensive unit tests:

```bash
npm test                   # Run all tests
npm run test:coverage      # Run tests with coverage
npm run test:watch         # Run tests in watch mode
```

## Troubleshooting

### Common Issues

1. **"SwitchBot API not initialized"**
   - Verify your token and secret are correct
   - Check that both token and secret are provided in configuration
   - Ensure you've enabled developer options in the SwitchBot app

2. **"Failed to get devices"**
   - Ensure your SwitchBot account has API access enabled
   - Verify your token hasn't expired
   - Check network connectivity
   - Verify the API base URL is correct

3. **Devices not appearing in Matter app**
   - Restart Matterbridge after configuration changes
   - Check Matterbridge logs for device registration errors
   - Ensure devices are online in the SwitchBot app
   - Verify the plugin is properly installed and configured

4. **Commands not working**
   - Verify device is online and responsive in SwitchBot app
   - Check if device type is supported
   - Review plugin logs for command errors
   - Ensure polling interval is not too aggressive

5. **Plugin not showing in Matterbridge UI**
   - Ensure the plugin is properly installed (`npm install -g matterbridge-switchbot`)
   - Check that the schema file is included in the package
   - Restart Matterbridge after installation
   - Verify Matterbridge version compatibility (>= 3.0.7)

### Debug Mode

Enable debug logging in your Matterbridge configuration:

```json
{
  "name": "SwitchBot",
  "type": "DynamicPlatform",
  "debug": true,
  ...
}
```

### Logs

Check Matterbridge logs for detailed information:
- Plugin initialization messages
- Device discovery results
- API communication status
- Error messages and stack traces

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Submit a pull request

## License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: Report bugs and feature requests on [GitHub Issues](https://github.com/derbirch/matterbridge-switchbot/issues)
- **Documentation**: Check the [Matterbridge documentation](https://github.com/Luligu/matterbridge) for general setup
- **SwitchBot API**: Refer to the [official SwitchBot API documentation](https://github.com/OpenWonderLabs/SwitchBotAPI)

## Changelog

### v1.0.2
- Added UI configuration schema for Matterbridge web interface
- Fixed TypeScript compilation issues
- Updated repository URLs and package metadata
- Improved error handling and logging

### v1.0.1
- Fixed plugin loading mechanism
- Updated dependencies and peer dependencies
- Improved installation instructions

### v1.0.0
- Initial release
- Support for SwitchBot API v1.1
- Physical device support (Bot, Plug, Lights, Curtains)
- Infrared device support (AC, TV, Light, Fan)
- Matter protocol integration
- Real-time status polling
- Comprehensive test suite

## Acknowledgments

- [Matterbridge](https://github.com/Luligu/matterbridge) - The bridge platform this plugin is built for
- [SwitchBot](https://www.switch-bot.com/) - For providing the API and devices
- [Matter](https://csa-iot.org/all-solutions/matter/) - The smart home standard

