<template>
  <div class="markdown-viewer">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <ProgressSpinner 
        style="width: 50px; height: 50px" 
        strokeWidth="4"
        class="pulse-glow"
      />
      <span class="ml-4 text-white/80 font-medium">Rendering content...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="!content || content.trim() === ''" class="text-center py-12">
      <div class="glass-card rounded-2xl p-8 max-w-md mx-auto">
        <i class="pi pi-file-o text-4xl text-white/40 mb-4"></i>
        <h3 class="text-xl font-semibold text-white/80 mb-2">No Content</h3>
        <p class="text-white/60">No markdown content to display</p>
      </div>
    </div>

    <!-- Markdown Content -->
    <div v-else class="markdown-content glass-card rounded-2xl p-6 md:p-8">
      <div 
        v-html="renderedContent" 
        class="prose prose-invert prose-lg max-w-none"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import ProgressSpinner from 'primevue/progressspinner'
import '../main.css'

// Props
const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Simple markdown parser
const parseMarkdown = (text) => {
  if (!text) return ''
  
  let html = text
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold text-white mb-4 mt-6 gradient-text">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold text-white mb-4 mt-8 gradient-text">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold text-white mb-6 mt-8 gradient-text">$1</h1>')
    
    // Bold and Italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold text-amber-400"><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-amber-400">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-blue-300">$1</em>')
    
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-900/50 border border-white/10 rounded-lg p-4 my-4 overflow-x-auto"><code class="text-green-300 text-sm font-mono">$1</code></pre>')
    .replace(/`(.*?)`/g, '<code class="bg-gray-800/50 text-cyan-300 px-2 py-1 rounded text-sm font-mono">$1</code>')
    
    // Lists
    .replace(/^\* (.*$)/gim, '<li class="text-white/90 mb-2 flex items-start"><span class="text-amber-500 mr-2">•</span><span>$1</span></li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="text-white/90 mb-2 flex items-start"><span class="text-blue-400 mr-2 font-semibold">$1.</span><span>$2</span></li>')
    
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-cyan-400 hover:text-cyan-300 underline transition-colors" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Line breaks
    .replace(/\n\n/g, '</p><p class="text-white/90 mb-4 leading-relaxed">')
    .replace(/\n/g, '<br>')

  // Wrap in paragraphs and handle lists
  html = html
    .split('\n')
    .map(line => {
      if (line.includes('<li')) {
        return line
      }
      if (line.includes('<h1') || line.includes('<h2') || line.includes('<h3') || 
          line.includes('<pre') || line.includes('</pre>') || line.trim() === '') {
        return line
      }
      if (!line.includes('<p') && !line.includes('</p>') && line.trim() !== '') {
        return `<p class="text-white/90 mb-4 leading-relaxed">${line}</p>`
      }
      return line
    })
    .join('\n')

  // Wrap consecutive list items in ul/ol
  html = html
    .replace(/(<li[^>]*>.*?<\/span><\/li>\n?)+/g, (match) => {
      if (match.includes('•')) {
        return `<ul class="list-none space-y-2 mb-6 ml-4">${match}</ul>`
      } else {
        return `<ol class="list-none space-y-2 mb-6 ml-4">${match}</ol>`
      }
    })

  return html
}

// Computed property for rendered content
const renderedContent = computed(() => {
  return parseMarkdown(props.content)
})
</script>

<style scoped>
.markdown-viewer {
  font-family: var(--font-secondary);
}

.markdown-content {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced prose styling */
.prose {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.7;
}

.prose h1,
.prose h2,
.prose h3 {
  font-family: var(--font-primary);
  font-weight: 700;
  letter-spacing: -0.025em;
}

.prose pre {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.prose code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.prose ul,
.prose ol {
  padding-left: 0;
}

.prose li {
  margin: 0;
  padding: 0;
}

.prose a {
  text-decoration: none;
  border-bottom: 1px solid currentColor;
  transition: all 0.3s ease;
}

.prose a:hover {
  border-bottom-color: transparent;
  text-shadow: 0 0 8px currentColor;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .prose {
    font-size: 0.95rem;
  }
  
  .prose h1 {
    font-size: 2rem;
  }
  
  .prose h2 {
    font-size: 1.75rem;
  }
  
  .prose h3 {
    font-size: 1.5rem;
  }
}
</style>