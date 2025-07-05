import { createHmac } from 'crypto';

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

export class SwitchBotApi {
  private config: SwitchBotConfig;
  private baseUrl: string;

  constructor(config: SwitchBotConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://api.switch-bot.com';
  }

  /**
   * Generate authentication headers for SwitchBot API v1.1
   */
  private generateAuthHeaders(): Record<string, string> {
    const t = Date.now().toString();
    const nonce = Math.random().toString(36).substring(2, 15);
    const data = this.config.token + t + nonce;
    const signToByte = Buffer.from(data, 'utf-8');
    const secret = Buffer.from(this.config.secret, 'utf-8');
    const signature = createHmac('sha256', secret).update(signToByte).digest('base64');

    return {
      'Authorization': this.config.token,
      'Content-Type': 'application/json',
      'charset': 'utf8',
      't': t,
      'sign': signature,
      'nonce': nonce,
    };
  }

  /**
   * Make HTTP request to SwitchBot API
   */
  private async makeRequest<T>(
    method: 'GET' | 'POST',
    endpoint: string,
    body?: any
  ): Promise<SwitchBotApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.generateAuthHeaders();

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && method === 'POST') {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data: any = await response.json();
      
      return {
        statusCode: data.statusCode || response.status,
        message: data.message || response.statusText,
        body: data.body || data,
      };
    } catch (error) {
      throw new Error(`SwitchBot API request failed: ${error}`);
    }
  }

  /**
   * Get all devices
   */
  async getDevices(): Promise<SwitchBotApiResponse<{
    deviceList: SwitchBotDevice[];
    infraredRemoteList: SwitchBotInfraredDevice[];
  }>> {
    return this.makeRequest('GET', '/v1.1/devices');
  }

  /**
   * Get device status
   */
  async getDeviceStatus(deviceId: string): Promise<SwitchBotApiResponse<SwitchBotDeviceStatus>> {
    return this.makeRequest('GET', `/v1.1/devices/${deviceId}/status`);
  }

  /**
   * Send command to device
   */
  async sendCommand(
    deviceId: string,
    command: SwitchBotCommandRequest
  ): Promise<SwitchBotApiResponse<any>> {
    return this.makeRequest('POST', `/v1.1/devices/${deviceId}/commands`, command);
  }

  /**
   * Get scenes
   */
  async getScenes(): Promise<SwitchBotApiResponse<any[]>> {
    return this.makeRequest('GET', '/v1.1/scenes');
  }

  /**
   * Execute scene
   */
  async executeScene(sceneId: string): Promise<SwitchBotApiResponse<any>> {
    return this.makeRequest('POST', `/v1.1/scenes/${sceneId}/execute`);
  }
}

