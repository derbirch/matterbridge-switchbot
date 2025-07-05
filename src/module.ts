import { Matterbridge, MatterbridgeDynamicPlatform, MatterbridgeEndpoint, onOffOutlet, onOffSwitch, dimmableLight, colorTemperatureLight, PlatformConfig } from 'matterbridge';
import { AnsiLogger, LogLevel } from 'matterbridge/logger';
import { SwitchBotApi, SwitchBotConfig, SwitchBotDevice, SwitchBotInfraredDevice } from './switchbot-api.js';

/**
 * This is the standard interface for Matterbridge plugins.
 * Each plugin should export a default function that follows this signature.
 *
 * @param {Matterbridge} matterbridge - An instance of MatterBridge.
 * @param {AnsiLogger} log - An instance of AnsiLogger. This is used for logging messages in a format that can be displayed with ANSI color codes and in the frontend.
 * @param {PlatformConfig} config - The platform configuration.
 * @returns {SwitchBotPlatform} - An instance of the MatterbridgeAccessory or MatterbridgeDynamicPlatform class. This is the main interface for interacting with the Matterbridge system.
 */
export default function initializePlugin(matterbridge: Matterbridge, log: AnsiLogger, config: PlatformConfig): SwitchBotPlatform {
  return new SwitchBotPlatform(matterbridge, log, config);
}

// Here we define the SwitchBotPlatform class, which extends the MatterbridgeDynamicPlatform.
export class SwitchBotPlatform extends MatterbridgeDynamicPlatform {
  private switchBotApi: SwitchBotApi | null = null;
  private switchBotDevices: Map<string, SwitchBotDevice | SwitchBotInfraredDevice> = new Map();
  private pollInterval: NodeJS.Timeout | null = null;

  constructor(matterbridge: Matterbridge, log: AnsiLogger, config: PlatformConfig) {
    // Always call super(matterbridge, log, config)
    super(matterbridge, log, config);

    // Verify that Matterbridge is the correct version
    if (this.verifyMatterbridgeVersion === undefined || typeof this.verifyMatterbridgeVersion !== 'function' || !this.verifyMatterbridgeVersion('3.0.7')) {
      throw new Error(
        `This plugin requires Matterbridge version >= "3.0.7". Please update Matterbridge from ${this.matterbridge.matterbridgeVersion} to the latest version in the frontend."`,
      );
    }

    this.log.info(`Initializing SwitchBot Platform...`);
    
    // Initialize SwitchBot API if credentials are provided
    if (config.token && config.secret) {
      const switchBotConfig: SwitchBotConfig = {
        token: config.token as string,
        secret: config.secret as string,
        baseUrl: config.baseUrl as string || 'https://api.switch-bot.com',
      };
      this.switchBotApi = new SwitchBotApi(switchBotConfig);
      this.log.info('SwitchBot API initialized');
    } else {
      this.log.error('SwitchBot token and secret are required in the configuration');
    }
  }

  override async onStart(reason?: string) {
    this.log.info(`onStart called with reason: ${reason ?? 'none'}`);

    if (!this.switchBotApi) {
      this.log.error('SwitchBot API not initialized. Please check your configuration.');
      return;
    }

    // Wait for the platform to fully load the select
    await this.ready;

    // Clean the selectDevice and selectEntity maps, if you want to reset the select.
    await this.clearSelect();

    // Discover and register SwitchBot devices
    await this.discoverDevices();

    // Start polling for device status updates
    this.startPolling();
  }

  override async onConfigure() {
    // Always call super.onConfigure()
    await super.onConfigure();

    this.log.info('onConfigure called');

    // Configure all your devices. The persisted attributes need to be updated.
    for (const device of this.getDevices()) {
      if (device.uniqueId) {
        this.log.info(`Configuring device: ${device.uniqueId}`);
        // Update device status
        await this.updateDeviceStatus(device.uniqueId);
      }
    }
  }

  override async onChangeLoggerLevel(logLevel: LogLevel) {
    this.log.info(`onChangeLoggerLevel called with: ${logLevel}`);
    // Change here the logger level of the api you use or of your devices
  }

  override async onShutdown(reason?: string) {
    // Always call super.onShutdown(reason)
    await super.onShutdown(reason);

    this.log.info(`onShutdown called with reason: ${reason ?? 'none'}`);
    
    // Stop polling
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    if (this.config.unregisterOnShutdown === true) await this.unregisterAllDevices();
  }

  private async discoverDevices() {
    if (!this.switchBotApi) {
      this.log.error('SwitchBot API not available');
      return;
    }

    this.log.info('Discovering SwitchBot devices...');
    
    try {
      const response = await this.switchBotApi.getDevices();
      
      if (response.statusCode !== 100) {
        this.log.error(`Failed to get devices: ${response.message}`);
        return;
      }

      const { deviceList, infraredRemoteList } = response.body;

      // Register physical devices
      for (const device of deviceList) {
        this.switchBotDevices.set(device.deviceId, device);
        await this.registerSwitchBotDevice(device);
      }

      // Register infrared remote devices
      for (const device of infraredRemoteList) {
        this.switchBotDevices.set(device.deviceId, device);
        await this.registerInfraredDevice(device);
      }

      this.log.info(`Discovered ${deviceList.length} physical devices and ${infraredRemoteList.length} infrared devices`);
    } catch (error) {
      this.log.error(`Error discovering devices: ${error}`);
    }
  }

  private async registerSwitchBotDevice(device: SwitchBotDevice) {
    this.log.info(`Registering SwitchBot device: ${device.deviceName} (${device.deviceType})`);

    let endpoint: MatterbridgeEndpoint;

    switch (device.deviceType.toLowerCase()) {
      case 'bot':
        endpoint = this.createSwitchDevice(device);
        break;
      case 'plug':
      case 'plug mini (us)':
      case 'plug mini (jp)':
        endpoint = this.createOutletDevice(device);
        break;
      case 'color bulb':
      case 'strip light':
      case 'ceiling light':
        endpoint = this.createLightDevice(device);
        break;
      case 'curtain':
      case 'roller shade':
        endpoint = this.createCurtainDevice(device);
        break;
      default:
        this.log.warn(`Unsupported device type: ${device.deviceType}`);
        return;
    }

    await this.registerDevice(endpoint);
  }

  private async registerInfraredDevice(device: SwitchBotInfraredDevice) {
    this.log.info(`Registering infrared device: ${device.deviceName} (${device.remoteType})`);

    let endpoint: MatterbridgeEndpoint;

    switch (device.remoteType.toLowerCase()) {
      case 'air conditioner':
      case 'tv':
      case 'light':
      case 'fan':
        endpoint = this.createInfraredSwitchDevice(device);
        break;
      default:
        this.log.warn(`Unsupported infrared device type: ${device.remoteType}`);
        return;
    }

    await this.registerDevice(endpoint);
  }

  private createSwitchDevice(device: SwitchBotDevice): MatterbridgeEndpoint {
    const endpoint = new MatterbridgeEndpoint(onOffSwitch, { uniqueStorageKey: device.deviceId })
      .createDefaultBridgedDeviceBasicInformationClusterServer(
        device.deviceName,
        device.deviceId,
        this.matterbridge.aggregatorVendorId,
        'SwitchBot',
        device.deviceType,
        1,
        '1.0.0'
      )
      .createDefaultPowerSourceWiredClusterServer()
      .addRequiredClusterServers()
      .addCommandHandler('on', async () => {
        await this.sendCommand(device.deviceId, { command: 'turnOn' });
      })
      .addCommandHandler('off', async () => {
        await this.sendCommand(device.deviceId, { command: 'turnOff' });
      });

    return endpoint;
  }

  private createOutletDevice(device: SwitchBotDevice): MatterbridgeEndpoint {
    const endpoint = new MatterbridgeEndpoint(onOffOutlet, { uniqueStorageKey: device.deviceId })
      .createDefaultBridgedDeviceBasicInformationClusterServer(
        device.deviceName,
        device.deviceId,
        this.matterbridge.aggregatorVendorId,
        'SwitchBot',
        device.deviceType,
        1,
        '1.0.0'
      )
      .createDefaultPowerSourceWiredClusterServer()
      .addRequiredClusterServers()
      .addCommandHandler('on', async () => {
        await this.sendCommand(device.deviceId, { command: 'turnOn' });
      })
      .addCommandHandler('off', async () => {
        await this.sendCommand(device.deviceId, { command: 'turnOff' });
      });

    return endpoint;
  }

  private createLightDevice(device: SwitchBotDevice): MatterbridgeEndpoint {
    const endpoint = new MatterbridgeEndpoint(colorTemperatureLight, { uniqueStorageKey: device.deviceId })
      .createDefaultBridgedDeviceBasicInformationClusterServer(
        device.deviceName,
        device.deviceId,
        this.matterbridge.aggregatorVendorId,
        'SwitchBot',
        device.deviceType,
        1,
        '1.0.0'
      )
      .createDefaultPowerSourceWiredClusterServer()
      .addRequiredClusterServers()
      .addCommandHandler('on', async () => {
        await this.sendCommand(device.deviceId, { command: 'turnOn' });
      })
      .addCommandHandler('off', async () => {
        await this.sendCommand(device.deviceId, { command: 'turnOff' });
      })
      .addCommandHandler('moveToLevel', async (data: any) => {
        const brightness = Math.round((data.request.level / 254) * 100);
        await this.sendCommand(device.deviceId, { command: 'setBrightness', parameter: brightness.toString() });
      })
      .addCommandHandler('moveToColorTemperature', async (data: any) => {
        const colorTemp = data.request.colorTemperatureMireds;
        await this.sendCommand(device.deviceId, { command: 'setColorTemperature', parameter: colorTemp.toString() });
      });

    return endpoint;
  }

  private createCurtainDevice(device: SwitchBotDevice): MatterbridgeEndpoint {
    const endpoint = new MatterbridgeEndpoint(onOffSwitch, { uniqueStorageKey: device.deviceId })
      .createDefaultBridgedDeviceBasicInformationClusterServer(
        device.deviceName,
        device.deviceId,
        this.matterbridge.aggregatorVendorId,
        'SwitchBot',
        device.deviceType,
        1,
        '1.0.0'
      )
      .createDefaultPowerSourceWiredClusterServer()
      .addRequiredClusterServers()
      .addCommandHandler('on', async () => {
        await this.sendCommand(device.deviceId, { command: 'turnOn' });
      })
      .addCommandHandler('off', async () => {
        await this.sendCommand(device.deviceId, { command: 'turnOff' });
      });

    return endpoint;
  }

  private createInfraredSwitchDevice(device: SwitchBotInfraredDevice): MatterbridgeEndpoint {
    const endpoint = new MatterbridgeEndpoint(onOffSwitch, { uniqueStorageKey: device.deviceId })
      .createDefaultBridgedDeviceBasicInformationClusterServer(
        device.deviceName,
        device.deviceId,
        this.matterbridge.aggregatorVendorId,
        'SwitchBot IR',
        device.remoteType,
        1,
        '1.0.0'
      )
      .createDefaultPowerSourceWiredClusterServer()
      .addRequiredClusterServers()
      .addCommandHandler('on', async () => {
        await this.sendCommand(device.deviceId, { command: 'turnOn' });
      })
      .addCommandHandler('off', async () => {
        await this.sendCommand(device.deviceId, { command: 'turnOff' });
      });

    return endpoint;
  }

  private async sendCommand(deviceId: string, command: { command: string; parameter?: string; commandType?: string }) {
    if (!this.switchBotApi) {
      this.log.error('SwitchBot API not available');
      return;
    }

    try {
      this.log.info(`Sending command to ${deviceId}: ${command.command}`);
      const response = await this.switchBotApi.sendCommand(deviceId, command);
      
      if (response.statusCode !== 100) {
        this.log.error(`Command failed: ${response.message}`);
      } else {
        this.log.info(`Command sent successfully to ${deviceId}`);
      }
    } catch (error) {
      this.log.error(`Error sending command to ${deviceId}: ${error}`);
    }
  }

  private async updateDeviceStatus(deviceId: string) {
    if (!this.switchBotApi) {
      return;
    }

    try {
      const response = await this.switchBotApi.getDeviceStatus(deviceId);
      
      if (response.statusCode === 100) {
        const status = response.body;
        const devices = this.getDevices();
        const device = devices.find(d => d.uniqueId === deviceId);
        
        if (device) {
          // Update device state based on status
          this.updateMatterDeviceState(device, status);
        }
      }
    } catch (error) {
      this.log.debug(`Error updating status for ${deviceId}: ${error}`);
    }
  }

  private updateMatterDeviceState(device: MatterbridgeEndpoint, status: any) {
    // Update Matter device state based on SwitchBot device status
    // This is a simplified implementation - you would need to map
    // SwitchBot status fields to Matter cluster attributes
    
    if (status.power !== undefined) {
      // For now, we'll skip the cluster updates as the API has changed
      // This would need to be updated based on the current Matterbridge API
      this.log.debug(`Device ${device.uniqueId} power status: ${status.power}`);
    }

    if (status.brightness !== undefined) {
      // For now, we'll skip the cluster updates as the API has changed
      // This would need to be updated based on the current Matterbridge API
      this.log.debug(`Device ${device.uniqueId} brightness: ${status.brightness}`);
    }
  }

  private startPolling() {
    const pollIntervalMs = (this.config.pollInterval as number || 30) * 1000;
    
    this.pollInterval = setInterval(async () => {
      for (const device of this.getDevices()) {
        if (device.uniqueId) {
          await this.updateDeviceStatus(device.uniqueId);
        }
      }
    }, pollIntervalMs);

    this.log.info(`Started polling device status every ${pollIntervalMs / 1000} seconds`);
  }
}

