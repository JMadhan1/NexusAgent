import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000',
})

export const api = {
  async getAgentAddress(): Promise<{ agentAddress: string }> {
    const { data } = await apiClient.get('/agent/address')
    return data
  },

  async getAgentAddresses(): Promise<{ orchestrator: string; researcher: string; analyst: string; synthesizer: string }> {
    const { data } = await apiClient.get('/agent/addresses')
    return data
  },

  async storeDelegation(delegation: any) {
    const { data } = await apiClient.post('/delegation/store', delegation)
    return data
  },

  async runAgent(agentRequest: any) {
    return apiClient.post('/agent/run', agentRequest, {
      responseType: 'stream',
    })
  },
}
