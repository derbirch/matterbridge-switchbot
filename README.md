# Matterbridge SwitchBot Plugin

A Matterbridge plugin that integrates SwitchBot devices with the Matter protocol, allowing you to control your SwitchBot devices through Matter-compatible smart home platforms like Apple HomeKit, Google Home, Amazon Alexa, and others.

## Features

- **Full SwitchBot API v1.1+ Support**: Uses the latest SwitchBot API with enhanced security
- **Wide Device Support**: Supports physical devices (Bot, Plug, Lights, Curtains) and infrared remote devices
- **Matter Protocol Integration**: Exposes SwitchBot devices as Matter-compatible devices
- **Real-time Status Updates**: Polls device status and updates Matter attributes accordingly
- **Secure Authentication**: Implements SwitchBot's HMAC-SHA256 signature authentication
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

### Method 1: NPM Installation (Recommended)
```bash
npm install -g matterbridge-switchbot
```

### Method 2: Manual Installation
1. Clone this repository
2. Install dependencies: `npm install`
3. Build the plugin: `npm run build`
4. Link to Matterbridge: `npm link matterbridge`

## Configuration

### Getting SwitchBot API Credentials

1. Open the SwitchBot app on your mobile device
2. Go to **Profile** → **Preferences**
3. Tap **App Version** 10 times to enable developer options
4. Go back and tap **Developer Options**
5. Generate your **Token** and **Secret**

### Plugin Configuration

Add the following configuration to your Matterbridge config file:

```json
{
  "name": "SwitchBot",
  "type": "DynamicPlatform",
  "token": "your-switchbot-token",
  "secret": "your-switchbot-secret",
  "baseUrl": "https://api.switch-bot.com",
  "pollInterval": 30,
  "unregisterOnShutdown": false
}
```

#### Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `name` | string | Yes | - | Plugin name (use "SwitchBot") |
| `type` | string | Yes | - | Platform type (use "DynamicPlatform") |
| `token` | string | Yes | - | Your SwitchBot API token |
| `secret` | string | Yes | - | Your SwitchBot API secret |
| `baseUrl` | string | No | `https://api.switch-bot.com` | SwitchBot API base URL |
| `pollInterval` | number | No | 30 | Status polling interval in seconds |
| `unregisterOnShutdown` | boolean | No | false | Unregister devices on shutdown |

## Usage

1. **Start Matterbridge**: The plugin will automatically discover your SwitchBot devices
2. **Device Registration**: Devices will be registered with Matter and appear in your smart home app
3. **Control Devices**: Use your Matter-compatible smart home platform to control devices
4. **Status Updates**: Device status is automatically synchronized every 30 seconds (configurable)

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
git clone <repository-url>
cd matterbridge-switchbot

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Link with Matterbridge for development
npm link matterbridge
```

### Project Structure

```
src/
├── module.ts              # Main plugin module
├── switchbot-api.ts       # SwitchBot API client
└── device-manager.ts      # Device discovery and management

test/
└── module.test.ts         # Unit tests

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

2. **"Failed to get devices"**
   - Ensure your SwitchBot account has API access enabled
   - Verify your token hasn't expired
   - Check network connectivity

3. **Devices not appearing in Matter app**
   - Restart Matterbridge after configuration changes
   - Check Matterbridge logs for device registration errors
   - Ensure devices are online in the SwitchBot app

4. **Commands not working**
   - Verify device is online and responsive in SwitchBot app
   - Check if device type is supported
   - Review plugin logs for command errors

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

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Submit a pull request

## License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: Report bugs and feature requests on GitHub
- **Documentation**: Check the Matterbridge documentation for general setup
- **SwitchBot API**: Refer to the official SwitchBot API documentation

## Changelog

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

