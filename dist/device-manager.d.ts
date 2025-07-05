import { AnsiLogger } from 'matterbridge/logger';
import { SwitchBotApi, SwitchBotDeviceStatus } from './switchbot-api.js';
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
export declare class DeviceManager {
    private devices;
    private api;
    private log;
    constructor(api: SwitchBotApi, log: AnsiLogger);
    /**
     * Discover and categorize all SwitchBot devices
     */
    discoverDevices(): Promise<ManagedDevice[]>;
    /**
     * Get all managed devices
     */
    getAllDevices(): ManagedDevice[];
    /**
     * Get a specific device by ID
     */
    getDevice(deviceId: string): ManagedDevice | undefined;
    /**
     * Get devices by type
     */
    getDevicesByType(type: string): ManagedDevice[];
    /**
     * Get devices with specific capabilities
     */
    getDevicesWithCapability(capability: keyof DeviceCapabilities): ManagedDevice[];
    /**
     * Update device status
     */
    updateDeviceStatus(deviceId: string): Promise<SwitchBotDeviceStatus | null>;
    /**
     * Update all device statuses
     */
    updateAllDeviceStatuses(): Promise<void>;
    /**
     * Send command to device
     */
    sendDeviceCommand(deviceId: string, command: string, parameter?: string): Promise<boolean>;
    /**
     * Create a managed device from SwitchBot device data
     */
    private createManagedDevice;
    /**
     * Determine device capabilities based on type
     */
    private determineCapabilities;
    /**
     * Get supported commands for a device
     */
    getSupportedCommands(deviceId: string): string[];
    /**
     * Validate if a command is supported by a device
     */
    isCommandSupported(deviceId: string, command: string): boolean;
}
//# sourceMappingURL=device-manager.d.ts.map