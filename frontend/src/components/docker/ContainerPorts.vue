<template>
  <div v-if="ports && ports.length > 0" @click.stop>
    <div 
      v-for="port in displayPorts" 
      :key="`${port.PrivatePort}-${port.Type}`"
      class="port-item d-flex align-items-center mb-1"
    >
      <!-- Port text -->
      <small class="port-text me-2">
        {{ port.PublicPort ? `${port.PublicPort}:` : '' }}{{ port.PrivatePort }}{{ port.Type ? `/${port.Type}` : '' }}
      </small>
      
      <!-- Smart port links -->
      <div v-if="port.PublicPort && port.Type === 'tcp'" class="port-links" @click.stop>
        <!-- Button group: primary Open link + dropdown with alternatives -->
        <div class="btn-group" v-if="isWebPort(port)">
          <!-- Primary open link (preferred protocol based on internal port) -->
          <a
            :href="getSmartProtocolUrl(port)"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-sm btn-outline-primary d-flex align-items-center"
            :title="`Open ${getSmartProtocolUrl(port)}`"
            @click.stop
          >
            <i class="bi bi-box-arrow-up-right me-1"></i>
            <span>{{ port.PrivatePort === 443 || port.PrivatePort === 8443 ? 'HTTPS' : 'HTTP' }}</span>
          </a>

          <!-- Dropdown toggle to pick alternative protocols or copy connection -->
          <button
            type="button"
            class="btn btn-sm btn-outline-primary dropdown-toggle dropdown-toggle-split"
            :id="`port-dropdown-${port.PublicPort}-${port.PrivatePort}`"
            @click="toggleDropdown"
          >
            <span class="visually-hidden">Toggle Dropdown</span>
          </button>

          <ul class="dropdown-menu" :aria-labelledby="`port-dropdown-${port.PublicPort}-${port.PrivatePort}`">
            <!-- Header with info tooltip -->
            <li>
              <h6 class="dropdown-header d-flex align-items-center">
                Other possible links
                <i 
                  class="bi bi-info-circle ms-2 text-muted" 
                  :title="'These are suggested protocols and database management tools based on the port mapping. The actual protocol may differ depending on the service configuration. Database tools like DBeaver, SSMS, and phpMyAdmin may require proper credentials.'"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                ></i>
              </h6>
            </li>
            
            <li v-for="protocol in getProtocolOptions(port)" :key="protocol.key">
              <!-- Separator -->
              <div v-if="protocol.action === 'separator'" class="dropdown-divider"></div>
              <h6 v-if="protocol.action === 'separator'" class="dropdown-header">{{ protocol.description }}</h6>
              
              <!-- Link items -->
              <a
                v-else-if="protocol.action === 'link'"
                class="dropdown-item d-flex align-items-center"
                :href="protocol.url"
                target="_blank"
                rel="noopener noreferrer"
                @click="handleLinkClick"
              >
                <i :class="protocol.icon" class="me-2"></i>
                <div>
                  <div class="fw-medium">{{ protocol.name }}</div>
                  <small class="text-muted">{{ protocol.description }}</small>
                </div>
              </a>
              
              <!-- Copy items -->
              <button
                v-else-if="protocol.action === 'copy'"
                class="dropdown-item d-flex align-items-center border-0 bg-transparent w-100 text-start"
                @click.stop="handleProtocolClick(protocol, $event)"
              >
                <i :class="protocol.icon" class="me-2"></i>
                <div>
                  <div class="fw-medium">{{ protocol.name }}</div>
                  <small class="text-muted">{{ protocol.description }}</small>
                </div>
              </button>
              
              <!-- Desktop app items -->
              <button
                v-else-if="protocol.action === 'desktop-app'"
                class="dropdown-item d-flex align-items-center border-0 bg-transparent w-100 text-start"
                @click.stop="handleDesktopAppClick(protocol, $event)"
              >
                <i :class="protocol.icon" class="me-2"></i>
                <div>
                  <div class="fw-medium">{{ protocol.name }}</div>
                  <small class="text-muted">{{ protocol.description }}</small>
                </div>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- Show more indicator -->
    <small v-if="uniquePortsCount > maxDisplay" class="text-muted">
      +{{ uniquePortsCount - maxDisplay }} more
    </small>
  </div>
  <span v-else class="text-muted">-</span>
</template>

<script setup>
import { computed, defineProps } from 'vue'

const props = defineProps({
    ports: {
        type: Array,
        default: () => []
    },
    maxDisplay: {
        type: Number,
        default: 3
    },
    containerName: {
        type: String,
        default: ''
    }
})

const displayPorts = computed(() => {
    // Deduplicate ports that are the same except for IP (IPv4 vs IPv6)
    const uniquePorts = []
    const seen = new Set()

    for (const port of props.ports) {
        // Create a key based on port info, ignoring IP version differences
        const key = `${port.PrivatePort}-${port.PublicPort || 'none'}-${port.Type}`

        if (!seen.has(key)) {
            seen.add(key)
            uniquePorts.push(port)
        }
    }

    return uniquePorts.slice(0, props.maxDisplay)
})

const uniquePortsCount = computed(() => {
    // Calculate total unique ports count for "show more" indicator
    const seen = new Set()

    for (const port of props.ports) {
        const key = `${port.PrivatePort}-${port.PublicPort || 'none'}-${port.Type}`
        seen.add(key)
    }

    return seen.size
})// Handle manual dropdown toggle
const toggleDropdown = (event) => {
    event.stopPropagation()
    const button = event.currentTarget
    const dropdown = button.nextElementSibling

    // Close all other dropdowns first
    document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        if (menu !== dropdown) {
            menu.classList.remove('show')
        }
    })

    // Toggle current dropdown
    dropdown.classList.toggle('show')

    // Initialize tooltips when dropdown opens
    if (dropdown.classList.contains('show')) {
        initializeTooltips(dropdown)
    }
}

// Initialize tooltips for elements within a container
const initializeTooltips = (container) => {
    try {
        const tooltipElements = container.querySelectorAll('[data-bs-toggle="tooltip"]')
        tooltipElements.forEach(element => {
            // Simple tooltip implementation
            if (!element._tooltip) {
                element._tooltip = true
                element.addEventListener('mouseenter', (e) => {
                    showTooltip(e.target)
                })
                element.addEventListener('mouseleave', (e) => {
                    hideTooltip()
                })
            }
        })
    } catch (error) {
        console.log('Tooltip initialization skipped:', error.message)
    }
}

// Simple tooltip implementation
let currentTooltip = null

const showTooltip = (element) => {
    hideTooltip() // Remove any existing tooltip

    const tooltipText = element.getAttribute('title')
    if (!tooltipText) return

    const tooltip = document.createElement('div')
    tooltip.className = 'custom-tooltip'
    tooltip.textContent = tooltipText
    tooltip.style.cssText = `
        position: absolute;
        background: #333;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 9999;
        pointer-events: none;
        max-width: 200px;
        word-wrap: break-word;
    `

    document.body.appendChild(tooltip)

    const rect = element.getBoundingClientRect()
    tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px'
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px'

    currentTooltip = tooltip
}

const hideTooltip = () => {
    if (currentTooltip) {
        currentTooltip.remove()
        currentTooltip = null
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', (event) => {
    if (!event.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
            menu.classList.remove('show')
        })
        hideTooltip() // Hide any open tooltips
    }
})

// Smart protocol detection based on internal port
const getSmartProtocolUrl = (port) => {
    const publicPort = port.PublicPort
    const privatePort = port.PrivatePort

    // Determine protocol based on internal (private) port
    if (privatePort === 443) {
        return `https://localhost:${publicPort}`
    } else if (privatePort === 80) {
        return `http://localhost:${publicPort}`
    } else if ([3000, 5173, 8080, 8081, 8083, 8085, 9000, 4200, 5000, 8000].includes(privatePort)) {
        // Common development/web ports - use HTTP
        return `http://localhost:${publicPort}`
    } else if (privatePort === 8443 || privatePort === 9443) {
        // Common HTTPS alternative ports
        return `https://localhost:${publicPort}`
    } else {
        // Default to HTTP for unknown ports
        return `http://localhost:${publicPort}`
    }
}

// Check if port should have a direct link (any TCP port with public mapping)
const isWebPort = (port) => {
    // Show buttons for any TCP port that has a public port mapping
    return port.PublicPort && port.Type === 'tcp'
}

// Handle protocol click for desktop applications
const handleDesktopAppClick = async (protocol, event) => {
    event.stopPropagation()

    try {
        // First, copy connection string to clipboard
        if (protocol.copyText) {
            await navigator.clipboard.writeText(protocol.copyText)
            console.log('Copied to clipboard:', protocol.copyText)
        }

        // Try to open desktop application using custom protocol
        if (protocol.appProtocol) {
            try {
                window.location.href = protocol.appProtocol
            } catch (err) {
                console.log('Custom protocol failed:', err)
            }
        }

        // Show instructions to user
        if (protocol.instructions) {
            showAppInstructions(protocol)
        }

        // Close dropdown
        const dropdown = event.target.closest('.dropdown-menu')
        if (dropdown) {
            dropdown.classList.remove('show')
        }
        hideTooltip()

    } catch (err) {
        console.error('handleDesktopAppClick error:', err)
    }
}

// Handle simple copy actions
const handleProtocolClick = async (protocol, event) => {
    try {
        if (!protocol || !protocol.copyText) return

        await navigator.clipboard.writeText(protocol.copyText)
        // Simple feedback via console; UI toast can be added later
        console.log('Copied to clipboard:', protocol.copyText)

        // Close dropdown and tooltip after copy
        const dropdown = event.target.closest('.dropdown-menu')
        if (dropdown) {
            dropdown.classList.remove('show')
        }
        hideTooltip()

        if (event && event.stopPropagation) event.stopPropagation()
    } catch (err) {
        console.error('handleProtocolClick error:', err)
        if (event && event.stopPropagation) event.stopPropagation()
    }
}

// Show instructions modal for opening desktop apps
const showAppInstructions = (protocol) => {
    // Remove any existing modal first
    const existingModal = document.querySelector('.desktop-app-modal-global')
    if (existingModal) {
        existingModal.remove()
    }

    // Create a simple modal with instructions
    const modal = document.createElement('div')
    modal.className = 'desktop-app-modal-global'
    modal.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: rgba(0, 0, 0, 0.5) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 999999 !important;
        padding: 20px !important;
        box-sizing: border-box !important;
    `

    const modalContent = document.createElement('div')
    modalContent.style.cssText = `
        background: white !important;
        padding: 1.5rem !important;
        border-radius: 0.5rem !important;
        max-width: 500px !important;
        width: 100% !important;
        max-height: 80vh !important;
        overflow-y: auto !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
        position: relative !important;
        margin: auto !important;
    `

    modalContent.innerHTML = `
        <div style="display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 1rem !important; padding-bottom: 0.5rem !important; border-bottom: 1px solid #dee2e6 !important;">
            <h5 style="margin: 0 !important; color: #333 !important; font-weight: 600 !important;">
                <i class="${protocol.icon}"></i> ${protocol.name}
            </h5>
            <button class="close-btn" style="background: none !important; border: none !important; font-size: 1.5rem !important; cursor: pointer !important; color: #6c757d !important; padding: 0 !important; width: 30px !important; height: 30px !important; display: flex !important; align-items: center !important; justify-content: center !important; border-radius: 50% !important;">&times;</button>
        </div>
        <div style="margin-bottom: 1rem !important;">
            <p style="margin-bottom: 0.75rem !important; color: #495057 !important;"><strong>Connection string copied to clipboard!</strong></p>
            <p style="margin-bottom: 0.75rem !important; color: #495057 !important; white-space: pre-line !important;">${protocol.instructions}</p>
            <div style="background: #f8f9fa !important; padding: 0.75rem !important; border-radius: 0.25rem !important; margin: 0.75rem 0 !important; border: 1px solid #dee2e6 !important;">
                <code style="background: none !important; color: #495057 !important; font-family: 'Courier New', monospace !important; word-break: break-all !important;">${protocol.copyText}</code>
            </div>
        </div>
        <div style="display: flex !important; justify-content: flex-end !important; padding-top: 0.5rem !important; border-top: 1px solid #dee2e6 !important;">
            <button class="btn-close" style="background: #007bff !important; color: white !important; border: none !important; padding: 0.5rem 1rem !important; border-radius: 0.25rem !important; cursor: pointer !important; font-weight: 500 !important;">Got it!</button>
        </div>
    `

    modal.appendChild(modalContent)
    document.body.appendChild(modal)

    // Add event listeners
    const closeBtn = modal.querySelector('.close-btn')
    const gotItBtn = modal.querySelector('.btn-close')

    const closeModal = () => {
        modal.remove()
    }

    closeBtn.addEventListener('click', closeModal)
    gotItBtn.addEventListener('click', closeModal)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal()
    })

    // Add hover effects
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.backgroundColor = '#f8f9fa'
        closeBtn.style.color = '#495057'
    })
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.backgroundColor = 'transparent'
        closeBtn.style.color = '#6c757d'
    })

    gotItBtn.addEventListener('mouseenter', () => {
        gotItBtn.style.backgroundColor = '#0056b3'
    })
    gotItBtn.addEventListener('mouseleave', () => {
        gotItBtn.style.backgroundColor = '#007bff'
    })

    // Auto-close after 15 seconds
    setTimeout(closeModal, 15000)
}

// Handle dropdown item link clicks
const handleLinkClick = (event) => {
    // Close dropdown and tooltip when clicking a link
    const dropdown = event.target.closest('.dropdown-menu')
    if (dropdown) {
        dropdown.classList.remove('show')
    }
    hideTooltip()
}

const getProtocolOptions = (port) => {
    const publicPort = port.PublicPort
    const privatePort = port.PrivatePort
    const containerName = props.containerName || 'container'
    const protocols = []

    // Always add HTTP first as you requested
    protocols.push({
        key: 'http-localhost',
        name: 'HTTP',
        description: `http://localhost:${publicPort}`,
        url: `http://localhost:${publicPort}`,
        icon: 'bi bi-globe text-primary',
        action: 'link'
    })

    // Then HTTPS
    protocols.push({
        key: 'https-localhost',
        name: 'HTTPS',
        description: `https://localhost:${publicPort}`,
        url: `https://localhost:${publicPort}`,
        icon: 'bi bi-shield-lock text-success',
        action: 'link'
    })

    // Special admin links for specific ports
    if (privatePort === 27017) {
        // MongoDB - add MongoDB Compass and web admin options
        protocols.push({
            key: 'mongo-compass',
            name: 'MongoDB Compass',
            description: 'Open in MongoDB Compass (if installed)',
            url: `mongodb://localhost:${publicPort}`,
            icon: 'bi bi-compass text-success',
            action: 'link'
        })
        protocols.push({
            key: 'mongo-express',
            name: 'Mongo Express Web Admin',
            description: 'Try Mongo Express (if available)',
            url: `http://localhost:8081`,
            icon: 'bi bi-gear-wide text-warning',
            action: 'link'
        })
        protocols.push({
            key: 'dbeaver-mongo',
            name: 'DBeaver',
            description: 'Open in DBeaver (universal DB tool)',
            copyText: `mongodb://localhost:${publicPort}`,
            appProtocol: `dbeaver://connect?url=mongodb://localhost:${publicPort}`,
            instructions: '1. Open DBeaver\n2. Create new connection\n3. Select MongoDB\n4. Paste the connection string',
            icon: 'bi bi-database-gear text-info',
            action: 'desktop-app'
        })
    }

    if (privatePort === 6379) {
        // Redis - add RedisInsight and web admin options
        protocols.push({
            key: 'redis-insight',
            name: 'RedisInsight',
            description: 'Open in RedisInsight (if installed)',
            url: `redis://localhost:${publicPort}`,
            icon: 'bi bi-lightning text-danger',
            action: 'link'
        })
        protocols.push({
            key: 'redis-commander',
            name: 'Redis Commander Web Admin',
            description: 'Try Redis Commander (if available)',
            url: `http://localhost:8081`,
            icon: 'bi bi-gear-wide text-warning',
            action: 'link'
        })
        protocols.push({
            key: 'dbeaver-redis',
            name: 'DBeaver',
            description: 'Open in DBeaver (universal DB tool)',
            copyText: `redis://localhost:${publicPort}`,
            appProtocol: `dbeaver://connect?url=redis://localhost:${publicPort}`,
            instructions: '1. Open DBeaver\n2. Create new connection\n3. Select Redis\n4. Paste the connection string',
            icon: 'bi bi-database-gear text-info',
            action: 'desktop-app'
        })
    }

    if (privatePort === 3306) {
        // MySQL - add MySQL Workbench and web admin options
        protocols.push({
            key: 'mysql-workbench',
            name: 'MySQL Workbench',
            description: 'Open in MySQL Workbench (if installed)',
            copyText: `mysql://localhost:${publicPort}`,
            appProtocol: `mysql://localhost:${publicPort}`,
            instructions: '1. Open MySQL Workbench\n2. Create new connection\n3. Set hostname: localhost\n4. Set port: ' + publicPort + '\n5. Enter username and password',
            icon: 'bi bi-tools text-primary',
            action: 'desktop-app'
        })
        protocols.push({
            key: 'phpmyadmin',
            name: 'phpMyAdmin',
            description: 'Try phpMyAdmin (if available)',
            url: `http://localhost:8080`,
            icon: 'bi bi-gear-wide text-warning',
            action: 'link'
        })
        protocols.push({
            key: 'dbeaver-mysql',
            name: 'DBeaver',
            description: 'Open in DBeaver (universal DB tool)',
            copyText: `mysql://localhost:${publicPort}`,
            appProtocol: `dbeaver://connect?url=mysql://localhost:${publicPort}`,
            instructions: '1. Open DBeaver\n2. Create new connection\n3. Select MySQL\n4. Paste the connection string',
            icon: 'bi bi-database-gear text-info',
            action: 'desktop-app'
        })
    }

    if (privatePort === 5432) {
        // PostgreSQL - add pgAdmin and other tools
        protocols.push({
            key: 'pgadmin',
            name: 'pgAdmin',
            description: 'Try pgAdmin (if available)',
            url: `http://localhost:8080`,
            icon: 'bi bi-gear-wide text-warning',
            action: 'link'
        })
        protocols.push({
            key: 'dbeaver-postgres',
            name: 'DBeaver',
            description: 'Open in DBeaver (universal DB tool)',
            copyText: `postgresql://localhost:${publicPort}`,
            appProtocol: `dbeaver://connect?url=postgresql://localhost:${publicPort}`,
            instructions: '1. Open DBeaver\n2. Create new connection\n3. Select PostgreSQL\n4. Paste the connection string',
            icon: 'bi bi-database-gear text-info',
            action: 'desktop-app'
        })
    }

    if (privatePort === 1433) {
        // SQL Server - add SSMS and other tools
        protocols.push({
            key: 'ssms',
            name: 'SQL Server Management Studio',
            description: 'Open in SSMS (if installed)',
            copyText: `Server=localhost,${publicPort};`,
            appProtocol: `ssms://connect?server=localhost,${publicPort}`,
            instructions: '1. Open SQL Server Management Studio\n2. Set Server name: localhost,' + publicPort + '\n3. Choose authentication method\n4. Click Connect',
            icon: 'bi bi-microsoft text-primary',
            action: 'desktop-app'
        })
        protocols.push({
            key: 'azure-data-studio',
            name: 'Azure Data Studio',
            description: 'Open in Azure Data Studio (if installed)',
            copyText: `Server=localhost,${publicPort};`,
            appProtocol: `azuredatastudio://connect?server=localhost,${publicPort}`,
            instructions: '1. Open Azure Data Studio\n2. Create new connection\n3. Set Server: localhost,' + publicPort + '\n4. Enter credentials',
            icon: 'bi bi-cloud-arrow-up text-info',
            action: 'desktop-app'
        })
        protocols.push({
            key: 'dbeaver-sqlserver',
            name: 'DBeaver',
            description: 'Open in DBeaver (universal DB tool)',
            copyText: `sqlserver://localhost:${publicPort}`,
            appProtocol: `dbeaver://connect?url=sqlserver://localhost:${publicPort}`,
            instructions: '1. Open DBeaver\n2. Create new connection\n3. Select SQL Server\n4. Paste the connection string',
            icon: 'bi bi-database-gear text-info',
            action: 'desktop-app'
        })
    }

    if (privatePort === 5984) {
        // CouchDB - add Fauxton and other tools
        protocols.push({
            key: 'couchdb-fauxton',
            name: 'Fauxton (CouchDB Admin)',
            description: 'CouchDB web interface',
            url: `http://localhost:${publicPort}/_utils`,
            icon: 'bi bi-gear-wide text-warning',
            action: 'link'
        })
        protocols.push({
            key: 'dbeaver-couchdb',
            name: 'DBeaver',
            description: 'Open in DBeaver (universal DB tool)',
            copyText: `http://localhost:${publicPort}`,
            appProtocol: `dbeaver://connect?url=http://localhost:${publicPort}`,
            instructions: '1. Open DBeaver\n2. Create new connection\n3. Select CouchDB\n4. Paste the connection string',
            icon: 'bi bi-database-gear text-info',
            action: 'desktop-app'
        })
    }

    if (privatePort === 9042) {
        // Cassandra - add tools
        protocols.push({
            key: 'dbeaver-cassandra',
            name: 'DBeaver',
            description: 'Open in DBeaver (universal DB tool)',
            copyText: `cassandra://localhost:${publicPort}`,
            appProtocol: `dbeaver://connect?cassandra=localhost:${publicPort}`,
            instructions: '1. Open DBeaver\n2. Create new connection\n3. Select Cassandra\n4. Use localhost:' + publicPort,
            icon: 'bi bi-database-gear text-info',
            action: 'desktop-app'
        })
    }

    // FTP
    protocols.push({
        key: 'ftp-localhost',
        name: 'FTP',
        description: `ftp://localhost:${publicPort}`,
        url: `ftp://localhost:${publicPort}`,
        icon: 'bi bi-folder text-warning',
        action: 'link'
    })

    // FTPS
    protocols.push({
        key: 'ftps-localhost',
        name: 'FTPS',
        description: `ftps://localhost:${publicPort}`,
        url: `ftps://localhost:${publicPort}`,
        icon: 'bi bi-folder-check text-success',
        action: 'link'
    })

    // Redis (for non-6379 ports or as alternative)
    if (privatePort !== 6379 && privatePort !== 27017 && privatePort !== 3306 && privatePort !== 5432 && privatePort !== 1433 && privatePort !== 5984 && privatePort !== 9042) {
        protocols.push({
            key: 'redis-localhost',
            name: 'Redis',
            description: `redis://localhost:${publicPort}`,
            copyText: `redis://localhost:${publicPort}`,
            icon: 'bi bi-memory text-danger',
            action: 'copy'
        })
    }

    // MongoDB (for non-27017 ports or as alternative)
    if (privatePort !== 27017 && privatePort !== 6379 && privatePort !== 3306 && privatePort !== 5432 && privatePort !== 1433 && privatePort !== 5984 && privatePort !== 9042) {
        protocols.push({
            key: 'mongo-localhost',
            name: 'MongoDB',
            description: `mongodb://localhost:${publicPort}`,
            copyText: `mongodb://localhost:${publicPort}`,
            icon: 'bi bi-database text-success',
            action: 'copy'
        })
    }

    // Add separator
    protocols.push({
        key: 'separator',
        name: 'Container URLs',
        description: 'Container Name URLs',
        icon: '',
        action: 'separator'
    })

    // Container name URLs
    protocols.push({
        key: 'http-container',
        name: 'HTTP (Container)',
        description: `http://${containerName}:${publicPort}`,
        url: `http://${containerName}:${publicPort}`,
        icon: 'bi bi-globe text-primary',
        action: 'link'
    })

    protocols.push({
        key: 'https-container',
        name: 'HTTPS (Container)',
        description: `https://${containerName}:${publicPort}`,
        url: `https://${containerName}:${publicPort}`,
        icon: 'bi bi-shield-lock text-success',
        action: 'link'
    })

    protocols.push({
        key: 'ftp-container',
        name: 'FTP (Container)',
        description: `ftp://${containerName}:${publicPort}`,
        url: `ftp://${containerName}:${publicPort}`,
        icon: 'bi bi-folder text-warning',
        action: 'link'
    })

    protocols.push({
        key: 'ftps-container',
        name: 'FTPS (Container)',
        description: `ftps://${containerName}:${publicPort}`,
        url: `ftps://${containerName}:${publicPort}`,
        icon: 'bi bi-folder-check text-success',
        action: 'link'
    })

    protocols.push({
        key: 'redis-container',
        name: 'Redis (Container)',
        description: `redis://${containerName}:${publicPort}`,
        copyText: `redis://${containerName}:${publicPort}`,
        icon: 'bi bi-memory text-danger',
        action: 'copy'
    })

    protocols.push({
        key: 'mongo-container',
        name: 'MongoDB (Container)',
        description: `mongodb://${containerName}:${publicPort}`,
        copyText: `mongodb://${containerName}:${publicPort}`,
        icon: 'bi bi-database text-success',
        action: 'copy'
    })

    // Add copy raw connection option
    protocols.push({
        key: 'separator2',
        name: 'Copy Options',
        description: 'Copy Options',
        icon: '',
        action: 'separator'
    })

    protocols.push({
        key: 'copy-localhost',
        name: 'Copy localhost:port',
        description: `localhost:${publicPort}`,
        copyText: `localhost:${publicPort}`,
        icon: 'bi bi-link-45deg text-muted',
        action: 'copy'
    })

    protocols.push({
        key: 'copy-container',
        name: 'Copy container:port',
        description: `${containerName}:${publicPort}`,
        copyText: `${containerName}:${publicPort}`,
        icon: 'bi bi-link-45deg text-muted',
        action: 'copy'
    })

    return protocols
}
</script>

<style scoped>
.port-item {
    line-height: 1.2;
}

.port-text {
    min-width: 100px;
    flex-shrink: 0;
}

.port-links {
    flex-shrink: 0;
}

.btn-group {
    position: relative;
}

.dropdown-menu {
    min-width: 250px;
    max-height: 300px;
    overflow-y: auto;
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    display: none;
    min-width: 10rem;
    padding: 0.5rem 0;
    margin: 0;
    font-size: 0.875rem;
    color: #212529;
    text-align: left;
    list-style: none;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 0.375rem;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.175);
}

.dropdown-menu.show {
    display: block;
}

/* Custom scrollbar for dropdown */
.dropdown-menu::-webkit-scrollbar {
    width: 6px;
}

.dropdown-menu::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

.dropdown-item {
    padding: 0.5rem 1rem;
    clear: both;
    font-weight: 400;
    color: #212529;
    text-decoration: none;
    white-space: nowrap;
    background-color: transparent;
    border: 0;
    display: block;
    width: 100%;
    text-align: inherit;
}

.dropdown-item:hover {
    background-color: #f8f9fa;
    color: #1e2125;
}

.dropdown-item.border-0 {
    border: none !important;
}

.dropdown-item.border-0:hover {
    background-color: #f8f9fa;
}

.dropdown-divider {
    height: 0;
    margin: 0.5rem 0;
    overflow: hidden;
    border-top: 1px solid rgba(0, 0, 0, 0.15);
}

.dropdown-header {
    display: block;
    padding: 0.5rem 1rem;
    margin-bottom: 0;
    font-size: 0.875rem;
    color: #6c757d;
    white-space: nowrap;
    border-bottom: 1px solid #e9ecef;
    background-color: #f8f9fa;
    font-weight: 600;
}

.dropdown-header i {
    cursor: help;
    font-size: 0.8rem;
}

.dropdown-header i:hover {
    color: #495057;
}

.custom-tooltip {
    position: absolute;
    background: #333;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 9999;
    pointer-events: none;
    max-width: 200px;
    word-wrap: break-word;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.btn-sm {
    font-size: 0.7rem;
    line-height: 1;
}

/* Remove desktop modal styles since we use inline styles now */
</style>