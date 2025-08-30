<template>
  <div class="dream-container min-h-screen">
    <!-- Elegant Header -->
    <header class="relative z-10 py-8 px-4">
      <div class="max-w-6xl mx-auto text-center">
        <div class="float-animation">
          <h1 class="text-5xl md:text-7xl font-bold gradient-text mb-4">
            Dream Weaver AI
          </h1>
          <p class="text-xl md:text-2xl text-white/80 font-light">
            Transform your dreams into actionable plans
          </p>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="relative z-10 px-4 pb-12">
      <div class="max-w-6xl mx-auto space-y-8">
        
        <!-- Input Section -->
        <section class="glass-card rounded-3xl p-8 md:p-12">
          <div class="max-w-4xl mx-auto">
            <h2 class="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
              What's your dream or goal?
            </h2>
            
            <div class="space-y-6">
              <Textarea
                v-model="userInputModel"
                placeholder="Describe your dream, goal, or vision in detail. The more specific you are, the better plan I can create for you..."
                rows="8"
                class="w-full text-lg resize-none"
                :class="{ 'border-red-400': inputError }"
              />
              
              <div v-if="inputError" class="text-red-400 text-sm">
                {{ inputError }}
              </div>
              
              <div class="text-center">
                <Button
                  @click="handleGeneratePlan"
                  :disabled="!canGenerate"
                  :loading="planStore.isGenerating"
                  class="px-12 py-4 text-xl font-semibold pulse-glow"
                  size="large"
                >
                  <i class="pi pi-sparkles mr-3"></i>
                  Create My Plan
                </Button>
              </div>
            </div>
          </div>
        </section>

        <!-- Loading State -->
        <section v-if="planStore.isGenerating" class="text-center py-12">
          <div class="glass-card rounded-2xl p-8 max-w-md mx-auto">
            <ProgressSpinner 
              style="width: 60px; height: 60px" 
              strokeWidth="3"
              class="pulse-glow mb-4"
            />
            <h3 class="text-xl font-semibold text-white mb-2">
              Crafting Your Plan
            </h3>
            <p class="text-white/70">
              AI is analyzing your dream and creating a personalized action plan...
            </p>
          </div>
        </section>

        <!-- Results Section -->
        <section v-if="planStore.hasGeneratedPlan && !planStore.isGenerating" class="space-y-8">
          <!-- Plan Display -->
          <div class="glass-card rounded-3xl p-8 md:p-12">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-2xl md:text-3xl font-bold gradient-text-accent">
                Your Personalized Plan
              </h2>
              <Button
                @click="handleClearPlan"
                outlined
                severity="secondary"
                class="glass-button"
              >
                <i class="pi pi-refresh mr-2"></i>
                New Plan
              </Button>
            </div>
            
            <MarkdownViewer 
              :content="planStore.generatedPlan"
              :loading="planStore.isGenerating"
            />
          </div>

          <!-- Integration Section -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Calendar Integration -->
            <div class="space-y-4">
              <h3 class="text-xl font-bold text-white flex items-center gap-2">
                <i class="pi pi-calendar text-purple-400"></i>
                Schedule Your Plan
              </h3>
              <CalendarIntegration :plan-content="planStore.generatedPlan" />
            </div>

            <!-- WhatsApp Integration -->
            <div class="space-y-4">
              <h3 class="text-xl font-bold text-white flex items-center gap-2">
                <i class="pi pi-whatsapp text-green-400"></i>
                chat your whatsapp Agent
              </h3>
              <WhatsAppIntegration :plan-content="planStore.generatedPlan" />
            </div>
          </div>
        </section>

        <!-- Empty State -->
        <section v-if="!planStore.hasGeneratedPlan && !planStore.isGenerating" class="text-center py-12">
          <div class="glass-card rounded-2xl p-8 max-w-2xl mx-auto">
            <div class="mb-6">
              <i class="pi pi-lightbulb text-6xl text-amber-400 mb-4"></i>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">
              Ready to Turn Dreams into Reality?
            </h3>
            <p class="text-white/70 text-lg leading-relaxed">
              Share your dreams, goals, or aspirations above, and I'll create a detailed, 
              actionable plan to help you achieve them. Whether it's starting a business, 
              learning a new skill, or planning a life change - let's make it happen together.
            </p>
          </div>
        </section>

      </div>
    </main>

    <!-- Error Toast -->
    <Toast />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import ProgressSpinner from 'primevue/progressspinner'
import Toast from 'primevue/toast'
import { usePlanStore } from './stores/planStore.js'
import MarkdownViewer from './components/MarkdownViewer.vue'
import CalendarIntegration from './components/CalendarIntegration.vue'
import WhatsAppIntegration from './components/WhatsAppIntegration.vue'
import './main.css'

// Composables
const planStore = usePlanStore()
const toast = useToast()

// Local state
const inputError = ref('')

// Computed properties
const userInputModel = computed({
  get: () => planStore.userInput,
  set: (value) => {
    planStore.setUserInput(value)
    if (inputError.value && value?.trim()) {
      inputError.value = ''
    }
  }
})

const canGenerate = computed(() => {
  return planStore.userInput?.trim().length > 0 && !planStore.isGenerating
})

// Methods
const validateInput = () => {
  inputError.value = ''
  
  if (!planStore.userInput?.trim()) {
    inputError.value = 'Please describe your dream or goal to generate a plan'
    return false
  }
  
  if (planStore.userInput.trim().length < 10) {
    inputError.value = 'Please provide more details about your dream or goal'
    return false
  }
  
  return true
}

const handleGeneratePlan = async () => {
  if (!validateInput()) {
    return
  }
  
  try {
    await planStore.generatePlan()
    
    toast.add({
      severity: 'success',
      summary: 'Plan Generated!',
      detail: 'Your personalized action plan is ready',
      life: 4000
    })
  } catch (error) {
    console.error('Failed to generate plan:', error)
    
    toast.add({
      severity: 'error',
      summary: 'Generation Failed',
      detail: error.message || 'Failed to generate plan. Please try again.',
      life: 5000
    })
  }
}

const handleClearPlan = () => {
  planStore.clearPlan()
  planStore.setUserInput('')
  
  toast.add({
    severity: 'info',
    summary: 'Plan Cleared',
    detail: 'Ready to create a new plan',
    life: 3000
  })
}
</script>

<style scoped>
/* Component-specific animations */
.dream-container {
  position: relative;
  overflow-x: hidden;
}

/* Enhanced glass morphism for main sections */
.glass-card {
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Staggered animation for integration cards */
.grid > div:nth-child(1) {
  animation: slideInLeft 0.8s ease-out;
}

.grid > div:nth-child(2) {
  animation: slideInRight 0.8s ease-out;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Enhanced button styling */
.p-button {
  border-radius: 16px;
  font-weight: 600;
  letter-spacing: 0.025em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.p-button:not(:disabled):hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 40px rgba(139, 92, 246, 0.4);
}

/* Enhanced textarea styling */
.p-textarea {
  font-size: 1.1rem;
  line-height: 1.6;
  padding: 1.5rem;
}

.p-textarea:focus {
  transform: scale(1.01);
  transition: transform 0.2s ease;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dream-container {
    padding: 0;
  }
  
  .glass-card {
    margin: 0 1rem;
    border-radius: 1.5rem;
  }
  
  .p-textarea {
    font-size: 1rem;
    padding: 1rem;
  }
}

/* Loading spinner enhancement */
.p-progress-spinner {
  filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.5));
}

/* Toast positioning */
:deep(.p-toast) {
  z-index: 9999;
}

:deep(.p-toast .p-toast-message) {
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  color: white;
}

:deep(.p-toast .p-toast-message.p-toast-message-success) {
  border-color: rgba(34, 197, 94, 0.3);
}

:deep(.p-toast .p-toast-message.p-toast-message-error) {
  border-color: rgba(239, 68, 68, 0.3);
}

:deep(.p-toast .p-toast-message.p-toast-message-info) {
  border-color: rgba(59, 130, 246, 0.3);
}
</style>