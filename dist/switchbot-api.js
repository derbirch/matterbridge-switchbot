import { createHmac } from 'crypto';
export class SwitchBotApi {
    config;
    baseUrl;
    constructor(config) {
        this.config = config;
        this.baseUrl = config.baseUrl || 'https://api.switch-bot.com';
    }
    /**
     * Generate authentication headers for SwitchBot API v1.1
     */
    generateAuthHeaders() {
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
    async makeRequest(method, endpoint, body) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = this.generateAuthHeaders();
        const options = {
            method,
            headers,
        };
        if (body && method === 'POST') {
            options.body = JSON.stringify(body);
        }
        try {
            const response = await fetch(url, options);
            const data = await response.json();
            return {
                statusCode: data.statusCode || response.status,
                message: data.message || response.statusText,
                body: data.body || data,
            };
        }
        catch (error) {
            throw new Error(`SwitchBot API request failed: ${error}`);
        }
    }
    /**
     * Get all devices
     */
    async getDevices() {
        return this.makeRequest('GET', '/v1.1/devices');
    }
    /**
     * Get device status
     */
    async getDeviceStatus(deviceId) {
        return this.makeRequest('GET', `/v1.1/devices/${deviceId}/status`);
    }
    /**
     * Send command to device
     */
    async sendCommand(deviceId, command) {
        return this.makeRequest('POST', `/v1.1/devices/${deviceId}/commands`, command);
    }
    /**
     * Get scenes
     */
    async getScenes() {
        return this.makeRequest('GET', '/v1.1/scenes');
    }
    /**
     * Execute scene
     */
    async executeScene(sceneId) {
        return this.makeRequest('POST', `/v1.1/scenes/${sceneId}/execute`);
    }
}
//# sourceMappingURL=switchbot-api.js.map