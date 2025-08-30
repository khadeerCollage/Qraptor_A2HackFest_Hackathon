<template>
  <div class="calendar-integration">
    <Card class="glass-card">
      <template #header>
        <div class="flex items-center gap-3 p-4">
          <i class="pi pi-calendar text-2xl text-purple-400"></i>
          <h3 class="text-xl font-bold text-black gradient-text">Add to Calendar</h3>
        </div>
      </template>
      
      <template #content>
        <div class="space-y-6">
          <!-- Event Title -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-white/80">Event Title</label>
            <InputText
              v-model="eventTitle"
              placeholder="Enter event title..."
              class="w-full"
              :class="{ 'border-red-400': !eventTitle && showValidation }"
            />
            <small v-if="!eventTitle && showValidation" class="text-red-400">
              Event title is required
            </small>
          </div>

          <!-- Date Selection -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-white/80">Date</label>
            <DatePicker
              v-model="selectedDate"
              :min-date="new Date()"
              date-format="mm/dd/yy"
              placeholder="Select date"
              class="w-full"
              :class="{ 'border-red-400': !selectedDate && showValidation }"
            />
            <small v-if="!selectedDate && showValidation" class="text-red-400">
              Date is required
            </small>
          </div>

          <!-- Time Selection -->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-white/80">Start Time</label>
              <DatePicker
                v-model="startTime"
                time-only
                hour-format="12"
                placeholder="Start time"
                class="w-full"
                :class="{ 'border-red-400': !startTime && showValidation }"
              />
              <small v-if="!startTime && showValidation" class="text-red-400">
                Start time is required
              </small>
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium text-white/80">End Time</label>
              <DatePicker
                v-model="endTime"
                time-only
                hour-format="12"
                placeholder="End time"
                class="w-full"
                :class="{ 'border-red-400': !endTime && showValidation }"
              />
              <small v-if="!endTime && showValidation" class="text-red-400">
                End time is required
              </small>
            </div>
          </div>

          <!-- Location (Optional) -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-white/80">Location (Optional)</label>
            <InputText
              v-model="location"
              placeholder="Enter location..."
              class="w-full"
            />
          </div>

          <!-- Description Preview -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-white/80">Description</label>
            <div class="glass-card p-4 rounded-lg max-h-32 overflow-y-auto">
              <p class="text-white/90 text-sm whitespace-pre-wrap">{{ planContent || 'No plan content available' }}</p>
            </div>
          </div>

          <!-- Calendar Provider Selection -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-white/80">Calendar Provider</label>
            <div class="grid grid-cols-2 gap-3">
              <Button
                @click="addToGoogleCalendar"
                :disabled="!isFormValid || isProcessing"
                class="glass-button flex items-center justify-center gap-2 p-3"
                :class="{ 'opacity-50 cursor-not-allowed': !isFormValid || isProcessing }"
              >
                <i class="pi pi-google text-lg"></i>
                <span>Google Calendar</span>
              </Button>
              
              <!-- <Button
                @click="addToOutlookCalendar"
                :disabled="!isFormValid || isProcessing"
                class="glass-button flex items-center justify-center gap-2 p-3"
                :class="{ 'opacity-50 cursor-not-allowed': !isFormValid || isProcessing }"
              >
                <i class="pi pi-microsoft text-lg"></i>
                <span>Outlook</span>
              </Button> -->
            </div>
          </div>

          <!-- Download ICS Option -->
          <div class="pt-4 border-t border-white/10">
            <Button
              @click="downloadICS"
              :disabled="!isFormValid || isProcessing"
              class="w-full glass-button flex items-center justify-center gap-2 p-3"
              :class="{ 'opacity-50 cursor-not-allowed': !isFormValid || isProcessing }"
            >
              <i class="pi pi-download text-lg"></i>
              <span>Download Calendar File (.ics)</span>
            </Button>
          </div>

          <!-- Processing State -->
          <div v-if="isProcessing" class="flex items-center justify-center gap-2 text-purple-400">
            <ProgressSpinner style="width: 20px; height: 20px" stroke-width="4" />
            <span class="text-sm">Processing...</span>
          </div>

          <!-- Success Message -->
          <Message v-if="successMessage" severity="success" class="mt-4">
            {{ successMessage }}
          </Message>

          <!-- Error Message -->
          <Message v-if="errorMessage" severity="error" class="mt-4">
            {{ errorMessage }}
          </Message>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import { usePlanStore } from '../stores/planStore.js'

const props = defineProps({
  planContent: {
    type: String,
    default: ''
  }
})

const planStore = usePlanStore()

// Form state
const eventTitle = ref('')
const selectedDate = ref(null)
const startTime = ref(null)
const endTime = ref(null)
const location = ref('')
const showValidation = ref(false)
const isProcessing = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Auto-populate event title from plan content
watch(() => props.planContent, (newContent) => {
  if (newContent && !eventTitle.value) {
    // Extract first line or create a generic title
    const firstLine = newContent.split('\n')[0]
    if (firstLine && firstLine.length > 0) {
      eventTitle.value = firstLine.replace(/^#+\s*/, '').trim() || 'Generated Plan Event'
    } else {
      eventTitle.value = 'Generated Plan Event'
    }
  }
}, { immediate: true })

// Form validation
const isFormValid = computed(() => {
  return eventTitle.value && 
         selectedDate.value && 
         startTime.value && 
         endTime.value &&
         startTime.value < endTime.value
})

// Clear messages
const clearMessages = () => {
  successMessage.value = ''
  errorMessage.value = ''
}

// Format date and time for calendar
const formatDateTime = (date, time) => {
  if (!date || !time) return null
  
  const combined = new Date(date)
  combined.setHours(time.getHours())
  combined.setMinutes(time.getMinutes())
  combined.setSeconds(0)
  combined.setMilliseconds(0)
  
  return combined
}

// Generate ICS content
const generateICS = () => {
  const startDateTime = formatDateTime(selectedDate.value, startTime.value)
  const endDateTime = formatDateTime(selectedDate.value, endTime.value)
  
  if (!startDateTime || !endDateTime) return null
  
  const formatICSDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }
  
  const escapeICSText = (text) => {
    return text.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n')
  }
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dream Weaver AI//Calendar Integration//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@dreamweaver.ai`,
    `DTSTART:${formatICSDate(startDateTime)}`,
    `DTEND:${formatICSDate(endDateTime)}`,
    `SUMMARY:${escapeICSText(eventTitle.value)}`,
    `DESCRIPTION:${escapeICSText(props.planContent || '')}`,
    location.value ? `LOCATION:${escapeICSText(location.value)}` : '',
    `CREATED:${formatICSDate(new Date())}`,
    `LAST-MODIFIED:${formatICSDate(new Date())}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(line => line).join('\r\n')
  
  return icsContent
}

// Add to Google Calendar
const addToGoogleCalendar = () => {
  if (!validateForm()) return
  
  clearMessages()
  isProcessing.value = true
  
  try {
    const startDateTime = formatDateTime(selectedDate.value, startTime.value)
    const endDateTime = formatDateTime(selectedDate.value, endTime.value)
    
    const googleUrl = new URL('https://calendar.google.com/calendar/render')
    googleUrl.searchParams.set('action', 'TEMPLATE')
    googleUrl.searchParams.set('text', eventTitle.value)
    googleUrl.searchParams.set('dates', `${startDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`)
    googleUrl.searchParams.set('details', props.planContent || '')
    if (location.value) {
      googleUrl.searchParams.set('location', location.value)
    }
    
    window.open(googleUrl.toString(), '_blank')
    successMessage.value = 'Opening Google Calendar...'
  } catch (error) {
    console.error('Error creating Google Calendar event:', error)
    errorMessage.value = 'Failed to create Google Calendar event'
  } finally {
    isProcessing.value = false
  }
}

// Add to Outlook Calendar
const addToOutlookCalendar = () => {
  if (!validateForm()) return
  
  clearMessages()
  isProcessing.value = true
  
  try {
    const startDateTime = formatDateTime(selectedDate.value, startTime.value)
    const endDateTime = formatDateTime(selectedDate.value, endTime.value)
    
    const outlookUrl = new URL('https://outlook.live.com/calendar/0/deeplink/compose')
    outlookUrl.searchParams.set('subject', eventTitle.value)
    outlookUrl.searchParams.set('startdt', startDateTime.toISOString())
    outlookUrl.searchParams.set('enddt', endDateTime.toISOString())
    outlookUrl.searchParams.set('body', props.planContent || '')
    if (location.value) {
      outlookUrl.searchParams.set('location', location.value)
    }
    
    window.open(outlookUrl.toString(), '_blank')
    successMessage.value = 'Opening Outlook Calendar...'
  } catch (error) {
    console.error('Error creating Outlook Calendar event:', error)
    errorMessage.value = 'Failed to create Outlook Calendar event'
  } finally {
    isProcessing.value = false
  }
}

// Download ICS file
const downloadICS = () => {
  if (!validateForm()) return
  
  clearMessages()
  isProcessing.value = true
  
  try {
    const icsContent = generateICS()
    if (!icsContent) {
      throw new Error('Failed to generate calendar file')
    }
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${eventTitle.value.replace(/[^a-zA-Z0-9]/g, '_')}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
    successMessage.value = 'Calendar file downloaded successfully!'
  } catch (error) {
    console.error('Error downloading ICS file:', error)
    errorMessage.value = 'Failed to download calendar file'
  } finally {
    isProcessing.value = false
  }
}

// Form validation
const validateForm = () => {
  showValidation.value = true
  
  if (!isFormValid.value) {
    errorMessage.value = 'Please fill in all required fields'
    return false
  }
  
  if (startTime.value >= endTime.value) {
    errorMessage.value = 'End time must be after start time'
    return false
  }
  
  return true
}

// Clear validation when form becomes valid
watch(isFormValid, (valid) => {
  if (valid) {
    showValidation.value = false
    clearMessages()
  }
})
</script>

<style scoped>
.calendar-integration {
  max-width: 600px;
  margin: 0 auto;
}

.p-datepicker input {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  color: white;
}

.p-datepicker input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.p-datepicker input:focus {
  border-color: var(--dream-purple);
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
}

.p-message {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
}

.p-message.p-message-success {
  border-color: rgba(34, 197, 94, 0.3);
  color: rgb(34, 197, 94);
}

.p-message.p-message-error {
  border-color: rgba(239, 68, 68, 0.3);
  color: rgb(239, 68, 68);
}
</style>