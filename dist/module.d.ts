import { Matterbridge, MatterbridgeDynamicPlatform, PlatformConfig } from 'matterbridge';
import { AnsiLogger, LogLevel } from 'matterbridge/logger';
/**
 * This is the standard interface for Matterbridge plugins.
 * Each plugin should export a default function that follows this signature.
 *
 * @param {Matterbridge} matterbridge - An instance of MatterBridge.
 * @param {AnsiLogger} log - An instance of AnsiLogger. This is used for logging messages in a format that can be displayed with ANSI color codes and in the frontend.
 * @param {PlatformConfig} config - The platform configuration.
 * @returns {SwitchBotPlatform} - An instance of the MatterbridgeAccessory or MatterbridgeDynamicPlatform class. This is the main interface for interacting with the Matterbridge system.
 */
export default function initializePlugin(matterbridge: Matterbridge, log: AnsiLogger, config: PlatformConfig): SwitchBotPlatform;
export declare class SwitchBotPlatform extends MatterbridgeDynamicPlatform {
    private switchBotApi;
    private switchBotDevices;
    private pollInterval;
    constructor(matterbridge: Matterbridge, log: AnsiLogger, config: PlatformConfig);
    onStart(reason?: string): Promise<void>;
    onConfigure(): Promise<void>;
    onChangeLoggerLevel(logLevel: LogLevel): Promise<void>;
    onShutdown(reason?: string): Promise<void>;
    private discoverDevices;
    private registerSwitchBotDevice;
    private registerInfraredDevice;
    private createSwitchDevice;
    private createOutletDevice;
    private createLightDevice;
    private createCurtainDevice;
    private createInfraredSwitchDevice;
    private sendCommand;
    private updateDeviceStatus;
    private updateMatterDeviceState;
    private startPolling;
}
//# sourceMappingURL=module.d.ts.map