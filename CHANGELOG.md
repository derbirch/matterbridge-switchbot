# Changelog

All notable changes to the Matterbridge SwitchBot Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-07-05

### Added
- Initial release of the Matterbridge SwitchBot Plugin
- Support for SwitchBot API v1.1 with HMAC-SHA256 authentication
- Physical device support:
  - SwitchBot Bot (exposed as Matter on/off switch)
  - SwitchBot Plug variants (exposed as Matter outlets)
  - SwitchBot Color Bulb (exposed as Matter color temperature light)
  - SwitchBot Strip Light (exposed as Matter color temperature light)
  - SwitchBot Ceiling Light (exposed as Matter color temperature light)
  - SwitchBot Curtain/Roller Shade (exposed as Matter on/off switch)
- Infrared remote device support:
  - Air Conditioner (exposed as Matter on/off switch)
  - TV (exposed as Matter on/off switch)
  - Light (exposed as Matter on/off switch)
  - Fan (exposed as Matter on/off switch)
- Real-time device status polling with configurable intervals
- Comprehensive device discovery and management
- TypeScript implementation with full type safety
- Unit test suite with 100% coverage
- Detailed documentation and setup instructions

### Features
- Automatic device discovery from SwitchBot cloud
- Secure API authentication using token and secret
- Matter protocol integration for cross-platform compatibility
- Configurable polling intervals for status updates
- Support for device-specific commands (brightness, color temperature, etc.)
- Error handling and logging for troubleshooting
- Clean shutdown with optional device unregistration

### Technical Details
- Built on Matterbridge 3.0.7+ platform
- Uses SwitchBot API v1.1 endpoints
- Implements proper Matter device types and clusters
- Follows Matterbridge plugin development best practices
- Includes comprehensive error handling and logging

### Documentation
- Complete README with installation and configuration instructions
- API reference and troubleshooting guide
- Development setup and contribution guidelines
- License and acknowledgments

