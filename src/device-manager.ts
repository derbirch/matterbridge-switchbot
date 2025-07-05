import { AnsiLogger } from 'matterbridge/logger';
import { SwitchBotApi, SwitchBotDevice, SwitchBotInfraredDevice, SwitchBotDeviceStatus } from './switchbot-api.js';

export interface DeviceCapabilities {
  supportsPower: boolean;
  supportsBrightness: boolean;
  supportsColor: boolean;
  supportsColorTemperature: boolean;
  supportsPosition: boolean;
  supportsTemperature: boolean;
  supportsHumidity: boolean;
  supportsBattery: boolean;
}

export interface ManagedDevice {
  id: string;
  name: string;
  type: string;
  isInfrared: boolean;
  hubDeviceId?: string;
  capabilities: DeviceCapabilities;
  lastStatus?: SwitchBotDeviceStatus;
  lastUpdated?: Date;
}

export class DeviceManager {
  private devices: Map<string, ManagedDevice> = new Map();
  private api: SwitchBotApi;
  private log: AnsiLogger;

  constructor(api: SwitchBotApi, log: AnsiLogger) {
    this.api = api;
    this.log = log;
  }

  /**
   * Discover and categorize all SwitchBot devices
   */
  async discoverDevices(): Promise<ManagedDevice[]> {
    this.log.info('Starting device discovery...');
    
    try {
      const response = await this.api.getDevices();
      
      if (response.statusCode !== 100) {
        throw new Error(`Failed to get devices: ${response.message}`);
      }

      const { deviceList, infraredRemoteList } = response.body;
      this.devices.clear();

      // Process physical devices
      for (const device of deviceList) {
        const managedDevice = this.createManagedDevice(device, false);
        this.devices.set(device.deviceId, managedDevice);
        this.log.info(`Discovered physical device: ${device.deviceName} (${device.deviceType})`);
      }

      // Process infrared devices
      for (const device of infraredRemoteList) {
        const managedDevice = this.createManagedDevice(device, true);
        this.devices.set(device.deviceId, managedDevice);
        this.log.info(`Discovered infrared device: ${device.deviceName} (${device.remoteType})`);
      }

      this.log.info(`Discovery complete: ${deviceList.length} physical, ${infraredRemoteList.length} infrared devices`);
      return Array.from(this.devices.values());
    } catch (error) {
      this.log.error(`Device discovery failed: ${error}`);
      throw error;
    }
  }

  /**
   * Get all managed devices
   */
  getAllDevices(): ManagedDevice[] {
    return Array.from(this.devices.values());
  }

  /**
   * Get a specific device by ID
   */
  getDevice(deviceId: string): ManagedDevice | undefined {
    return this.devices.get(deviceId);
  }

  /**
   * Get devices by type
   */
  getDevicesByType(type: string): ManagedDevice[] {
    return Array.from(this.devices.values()).filter(device => 
      device.type.toLowerCase().includes(type.toLowerCase())
    );
  }

  /**
   * Get devices with specific capabilities
   */
  getDevicesWithCapability(capability: keyof DeviceCapabilities): ManagedDevice[] {
    return Array.from(this.devices.values()).filter(device => 
      device.capabilities[capability]
    );
  }

  /**
   * Update device status
   */
  async updateDeviceStatus(deviceId: string): Promise<SwitchBotDeviceStatus | null> {
    const device = this.devices.get(deviceId);
    if (!device) {
      this.log.warn(`Device ${deviceId} not found`);
      return null;
    }

    try {
      const response = await this.api.getDeviceStatus(deviceId);
      
      if (response.statusCode === 100) {
        device.lastStatus = response.body;
        device.lastUpdated = new Date();
        this.log.debug(`Updated status for ${device.name}`);
        return response.body;
      } else {
        this.log.warn(`Failed to get status for ${device.name}: ${response.message}`);
        return null;
      }
    } catch (error) {
      this.log.error(`Error updating status for ${device.name}: ${error}`);
      return null;
    }
  }

  /**
   * Update all device statuses
   */
  async updateAllDeviceStatuses(): Promise<void> {
    const updatePromises = Array.from(this.devices.keys()).map(deviceId => 
      this.updateDeviceStatus(deviceId)
    );
    
    await Promise.allSettled(updatePromises);
  }

  /**
   * Send command to device
   */
  async sendDeviceCommand(deviceId: string, command: string, parameter?: string): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device) {
      this.log.warn(`Device ${deviceId} not found`);
      return false;
    }

    try {
      const response = await this.api.sendCommand(deviceId, {
        command,
        parameter,
        commandType: device.isInfrared ? 'customize' : 'command'
      });

      if (response.statusCode === 100) {
        this.log.info(`Command '${command}' sent successfully to ${device.name}`);
        return true;
      } else {
        this.log.error(`Command failed for ${device.name}: ${response.message}`);
        return false;
      }
    } catch (error) {
      this.log.error(`Error sending command to ${device.name}: ${error}`);
      return false;
    }
  }

  /**
   * Create a managed device from SwitchBot device data
   */
  private createManagedDevice(
    device: SwitchBotDevice | SwitchBotInfraredDevice, 
    isInfrared: boolean
  ): ManagedDevice {
    const deviceType = isInfrared 
      ? (device as SwitchBotInfraredDevice).remoteType 
      : (device as SwitchBotDevice).deviceType;

    return {
      id: device.deviceId,
      name: device.deviceName,
      type: deviceType,
      isInfrared,
      hubDeviceId: device.hubDeviceId,
      capabilities: this.determineCapabilities(deviceType, isInfrared),
    };
  }

  /**
   * Determine device capabilities based on type
   */
  private determineCapabilities(deviceType: string, isInfrared: boolean): DeviceCapabilities {
    const type = deviceType.toLowerCase();
    
    const capabilities: DeviceCapabilities = {
      supportsPower: false,
      supportsBrightness: false,
      supportsColor: false,
      supportsColorTemperature: false,
      supportsPosition: false,
      supportsTemperature: false,
      supportsHumidity: false,
      supportsBattery: false,
    };

    // Physical device capabilities
    if (!isInfrared) {
      switch (type) {
        case 'bot':
          capabilities.supportsPower = true;
          capabilities.supportsBattery = true;
          break;
        
        case 'plug':
        case 'plug mini (us)':
        case 'plug mini (jp)':
          capabilities.supportsPower = true;
          break;
        
        case 'color bulb':
          capabilities.supportsPower = true;
          capabilities.supportsBrightness = true;
          capabilities.supportsColor = true;
          capabilities.supportsColorTemperature = true;
          break;
        
        case 'strip light':
        case 'strip light 3':
          capabilities.supportsPower = true;
          capabilities.supportsBrightness = true;
          capabilities.supportsColor = true;
          break;
        
        case 'ceiling light':
          capabilities.supportsPower = true;
          capabilities.supportsBrightness = true;
          capabilities.supportsColorTemperature = true;
          break;
        
        case 'curtain':
        case 'roller shade':
          capabilities.supportsPower = true;
          capabilities.supportsPosition = true;
          capabilities.supportsBattery = true;
          break;
        
        case 'meter':
        case 'meter plus':
        case 'meter pro':
        case 'outdoor meter':
          capabilities.supportsTemperature = true;
          capabilities.supportsHumidity = true;
          capabilities.supportsBattery = true;
          break;
        
        case 'humidifier':
        case 'evaporative humidifier':
          capabilities.supportsPower = true;
          capabilities.supportsHumidity = true;
          break;
        
        case 'air purifier':
        case 'air purifier voc':
        case 'air purifier table voc':
        case 'air purifier pm2.5':
          capabilities.supportsPower = true;
          break;
        
        case 'lock':
        case 'lock pro':
        case 'lock ultra':
        case 'lock lite':
          capabilities.supportsPower = true;
          capabilities.supportsBattery = true;
          break;
        
        case 'motion sensor':
        case 'contact sensor':
        case 'water leak detector':
          capabilities.supportsBattery = true;
          break;
        
        case 'robot vacuum cleaner s1':
        case 'robot vacuum cleaner s1 plus':
        case 'robot vacuum cleaner k10+':
        case 'robot vacuum cleaner k10+ pro':
        case 'robot vacuum cleaner s10':
        case 'robot vacuum cleaner s20':
        case 'robot vacuum cleaner k20+ pro':
          capabilities.supportsPower = true;
          capabilities.supportsBattery = true;
          break;
      }
    } else {
      // Infrared device capabilities
      switch (type) {
        case 'air conditioner':
        case 'tv':
        case 'light':
        case 'fan':
        case 'projector':
        case 'speaker':
        case 'water heater':
        case 'air purifier':
          capabilities.supportsPower = true;
          break;
        
        case 'set top box':
        case 'dvd':
        case 'camera':
          capabilities.supportsPower = true;
          break;
      }
    }

    return capabilities;
  }

  /**
   * Get supported commands for a device
   */
  getSupportedCommands(deviceId: string): string[] {
    const device = this.devices.get(deviceId);
    if (!device) return [];

    const commands: string[] = [];
    const { capabilities, type, isInfrared } = device;

    if (capabilities.supportsPower) {
      commands.push('turnOn', 'turnOff');
    }

    if (!isInfrared) {
      if (capabilities.supportsBrightness) {
        commands.push('setBrightness');
      }
      
      if (capabilities.supportsColor) {
        commands.push('setColor');
      }
      
      if (capabilities.supportsColorTemperature) {
        commands.push('setColorTemperature');
      }
      
      if (capabilities.supportsPosition) {
        commands.push('setPosition', 'pause');
      }

      // Device-specific commands
      const deviceType = type.toLowerCase();
      if (deviceType.includes('lock')) {
        commands.push('lock', 'unlock');
      }
      
      if (deviceType.includes('robot vacuum')) {
        commands.push('start', 'stop', 'dock');
      }
      
      if (deviceType.includes('humidifier')) {
        commands.push('setMode');
      }
    }

    return commands;
  }

  /**
   * Validate if a command is supported by a device
   */
  isCommandSupported(deviceId: string, command: string): boolean {
    const supportedCommands = this.getSupportedCommands(deviceId);
    return supportedCommands.includes(command);
  }
}

