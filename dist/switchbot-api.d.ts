export interface SwitchBotConfig {
    token: string;
    secret: string;
    baseUrl?: string;
}
export interface SwitchBotDevice {
    deviceId: string;
    deviceName: string;
    deviceType: string;
    enableCloudService: boolean;
    hubDeviceId?: string;
}
export interface SwitchBotInfraredDevice {
    deviceId: string;
    deviceName: string;
    remoteType: string;
    hubDeviceId: string;
}
export interface SwitchBotDeviceStatus {
    deviceId: string;
    deviceType: string;
    hubDeviceId?: string;
    [key: string]: any;
}
export interface SwitchBotCommandRequest {
    command: string;
    parameter?: string;
    commandType?: string;
}
export interface SwitchBotApiResponse<T = any> {
    statusCode: number;
    message: string;
    body: T;
}
export declare class SwitchBotApi {
    private config;
    private baseUrl;
    constructor(config: SwitchBotConfig);
    /**
     * Generate authentication headers for SwitchBot API v1.1
     */
    private generateAuthHeaders;
    /**
     * Make HTTP request to SwitchBot API
     */
    private makeRequest;
    /**
     * Get all devices
     */
    getDevices(): Promise<SwitchBotApiResponse<{
        deviceList: SwitchBotDevice[];
        infraredRemoteList: SwitchBotInfraredDevice[];
    }>>;
    /**
     * Get device status
     */
    getDeviceStatus(deviceId: string): Promise<SwitchBotApiResponse<SwitchBotDeviceStatus>>;
    /**
     * Send command to device
     */
    sendCommand(deviceId: string, command: SwitchBotCommandRequest): Promise<SwitchBotApiResponse<any>>;
    /**
     * Get scenes
     */
    getScenes(): Promise<SwitchBotApiResponse<any[]>>;
    /**
     * Execute scene
     */
    executeScene(sceneId: string): Promise<SwitchBotApiResponse<any>>;
}
//# sourceMappingURL=switchbot-api.d.ts.map