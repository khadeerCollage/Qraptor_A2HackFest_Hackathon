import { defineStore } from 'pinia'
import { generatePlan } from '../services/aiService.js'

export const usePlanStore = defineStore('plan', {
  state: () => ({
    userInput: '',
    generatedPlan: '',
    isGenerating: false,
    phoneNumber: ''
  }),

  getters: {
    hasGeneratedPlan: (state) => {
      return state.generatedPlan && state.generatedPlan.trim().length > 0
    },

    isValidPhoneNumber: (state) => {
      if (!state.phoneNumber) return false
      // Basic phone number validation - allows various formats
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
      const cleanPhone = state.phoneNumber.replace(/[\s\-\(\)]/g, '')
      return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10
    }
  },

  actions: {
    setUserInput(input) {
      this.userInput = input || ''
    },

    setPhoneNumber(phone) {
      this.phoneNumber = phone || ''
    },

    clearPlan() {
      this.generatedPlan = ''
      this.isGenerating = false
    },

    async generatePlan() {
      if (!this.userInput || this.userInput.trim().length === 0) {
        throw new Error('User input is required to generate a plan')
      }

      this.isGenerating = true
      this.generatedPlan = ''

      try {
        const plan = await generatePlan(this.userInput.trim())
        this.generatedPlan = plan || ''
      } catch (error) {
        console.error('Failed to generate plan:', error)
        this.generatedPlan = ''
        throw new Error('Failed to generate plan. Please try again.')
      } finally {
        this.isGenerating = false
      }
    }
  }
})