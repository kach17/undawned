/**
 * UIManager - Centralized UI management with event-driven architecture
 * Handles all DOM manipulation and UI state
 */
class UIManager {
    constructor(eventSystem = window.GameEvents) {
        this.eventSystem = eventSystem;
        
        // DOM elements
        this.elements = {
            daen: document.getElementById('daen-count'),
            minionButtons: document.getElementById('minion-buttons'),
            tooltip: document.getElementById('tooltip')
        };
        
        // UI state
        this.state = {
            selectedMinionType: null,
            daenValue: 0,
            tooltipVisible: false
        };
        
        // Component managers
        this.tooltipManager = new TooltipManager(this.eventSystem);
        this.floatingTextManager = new FloatingTextManager();
        this.minionButtonManager = new MinionButtonManager(this.eventSystem);
        
        // Bind methods to preserve context
        this.bindMethods();
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    /**
     * Bind methods to preserve context
     */
    bindMethods() {
        this.updateDaenDisplay = this.updateDaenDisplay.bind(this);
        this.showFloatingText = this.showFloatingText.bind(this);
        this.selectMinionButton = this.selectMinionButton.bind(this);
        this.deselectMinionButtons = this.deselectMinionButtons.bind(this);
    }
    
    /**
     * Setup event listeners for UI events
     */
    setupEventListeners() {
        // Listen for game events
        this.eventSystem.on('daen:updated', this.updateDaenDisplay);
        this.eventSystem.on('ui:showFloatingText', this.showFloatingText);
        this.eventSystem.on('minion:selected', this.selectMinionButton);
        this.eventSystem.on('minion:deselected', this.deselectMinionButtons);
        this.eventSystem.on('game:initialized', this.initialize.bind(this));
    }
    
    /**
     * Initialize UI components
     * @param {Object} [config={}] - Configuration options
     */
    initialize(config = {}) {
        this.minionButtonManager.initialize(config.minions || MinionRegistry);
        this.setupMinionButtonHandlers();
        
        // Initial UI state
        this.updateDaenDisplay(config.initialDaen || 0);
        
        this.eventSystem.emit('ui:initialized');
    }
    
    /**
     * Setup minion button click handlers
     */
    setupMinionButtonHandlers() {
        this.minionButtonManager.onButtonClick((minionType, buttonElement) => {
            // Toggle selection logic
            if (this.state.selectedMinionType === minionType) {
                this.eventSystem.emit('input:minionDeselected');
            } else {
                this.eventSystem.emit('input:minionSelected', { 
                    type: minionType, 
                    element: buttonElement 
                });
            }
        });
    }
    
    /**
     * Update the Daen display in the UI
     * @param {number|Object} data - Daen value or event data object
     */
    updateDaenDisplay(data) {
        const daenValue = typeof data === 'number' ? data : data.value;
        
        if (this.elements.daen && daenValue !== undefined) {
            this.elements.daen.textContent = Math.floor(daenValue);
            this.state.daenValue = daenValue;
        }
    }
    
    /**
     * Display floating text with flexible configuration
     * @param {string|Object} textOrConfig - Text string or configuration object
     * @param {number} [x] - X position (if textOrConfig is string)
     * @param {number} [y] - Y position (if textOrConfig is string)
     * @param {Object} [options={}] - Additional options
     */
    showFloatingText(textOrConfig, x, y, options = {}) {
        let config;
        
        if (typeof textOrConfig === 'string') {
            config = {
                text: textOrConfig,
                x: x || window.innerWidth / 2,
                y: y || window.innerHeight / 2,
                ...options
            };
        } else {
            config = textOrConfig;
        }
        
        this.floatingTextManager.show(config);
    }
    
    /**
     * Select a minion button visually
     * @param {string|Object} data - Minion type or event data
     */
    selectMinionButton(data) {
        const minionType = typeof data === 'string' ? data : data.type;
        this.minionButtonManager.selectButton(minionType);
        this.state.selectedMinionType = minionType;
    }
    
    /**
     * Deselect all minion buttons
     */
    deselectMinionButtons() {
        this.minionButtonManager.deselectAll();
        this.state.selectedMinionType = null;
    }
    
    /**
     * Get UI callbacks object for backward compatibility
     * @returns {Object} Object containing UI callback functions
     */
    getGameCallbacks() {
        return {
            updateDaenDisplay: this.updateDaenDisplay,
            showFloatingText: this.showFloatingText
        };
    }
    
    /**
     * Get minion button callbacks for backward compatibility
     * @returns {Object} Object containing minion button callback functions
     */
    getMinionButtonCallbacks() {
        return {
            select: this.selectMinionButton,
            deselectAll: this.deselectMinionButtons
        };
    }
    
    /**
     * Clean up UI manager and all components
     */
    destroy() {
        // Clear event listeners
        this.eventSystem.off('daen:updated', this.updateDaenDisplay);
        this.eventSystem.off('ui:showFloatingText', this.showFloatingText);
        this.eventSystem.off('minion:selected', this.selectMinionButton);
        this.eventSystem.off('minion:deselected', this.deselectMinionButtons);
        
        // Destroy components
        this.tooltipManager.destroy();
        this.floatingTextManager.destroy();
        this.minionButtonManager.destroy();
        
        // Clear state
        this.state = {};
        this.elements = {};
    }
}

/**
 * MinionButtonManager - Manages minion selection buttons
 */
class MinionButtonManager {
    constructor(eventSystem) {
        this.eventSystem = eventSystem;
        this.buttons = new Map();
        this.clickHandler = null;
        this.container = document.getElementById('minion-buttons');
    }
    
    /**
     * Initialize minion buttons
     * @param {Object} minionRegistry - Registry of minion classes
     */
    initialize(minionRegistry) {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        this.buttons.clear();
        
        let index = 0;
        for (const [type, MinionClass] of Object.entries(minionRegistry)) {
            const button = this.createButton(type, MinionClass, index++);
            this.buttons.set(type, button);
            this.container.appendChild(button);
        }
    }
    
    /**
     * Create a minion button element
     * @param {string} type - Minion type
     * @param {Function} MinionClass - Minion class constructor
     * @param {number} index - Button index
     * @returns {HTMLElement} Button element
     */
    createButton(type, MinionClass, index) {
        const button = document.createElement('div');
        button.className = 'minion-button';
        button.dataset.type = type;
        button.dataset.index = index;
        
        const stats = this.getMinionStats(MinionClass);
        
        button.innerHTML = `
            <div class="minion-icon" style="background-color: ${MinionClass.prototype.color || '#555'}"></div>
            <div class="minion-info">
                <div class="minion-name">${MinionClass.name}</div>
                <div class="minion-cost">${MinionClass.cost} Daen</div>
            </div>
        `;
        
        // Add click handler
        button.addEventListener('click', () => {
            if (this.clickHandler) {
                this.clickHandler(type, button);
            }
        });
        
        // Add tooltip events
        this.setupTooltipEvents(button, stats);
        
        return button;
    }
    
    /**
     * Setup tooltip events for a button
     * @param {HTMLElement} button - Button element
     * @param {Object} stats - Minion stats for tooltip
     */
    setupTooltipEvents(button, stats) {
        button.addEventListener('mouseenter', (e) => {
            this.eventSystem.emit('tooltip:show', {
                element: button,
                data: stats,
                x: e.clientX + 10,
                y: e.clientY + 10
            });
        });
        
        button.addEventListener('mousemove', (e) => {
            this.eventSystem.emit('tooltip:move', {
                x: e.clientX + 10,
                y: e.clientY + 10
            });
        });
        
        button.addEventListener('mouseleave', () => {
            this.eventSystem.emit('tooltip:hide');
        });
    }
    
    /**
     * Get minion stats for tooltip
     * @param {Function} MinionClass - Minion class
     * @returns {Object} Stats object
     */
    getMinionStats(MinionClass) {
        const stats = {
            name: MinionClass.name,
            description: MinionClass.description,
            cost: MinionClass.cost,
            stats: {},
            abilities: []
        };
        
        try {
            const tempInstance = new MinionClass(0, 0, null);
            stats.stats = {
                'Health': tempInstance.health,
                'Damage': tempInstance.damage,
                'Attack Speed': tempInstance.attackSpeed.toFixed(1) + '/s',
                'Range': tempInstance.attackRange,
                'Move Speed': tempInstance.moveSpeed.toFixed(1)
            };
        } catch (error) {
            console.warn('Could not create temporary instance for', MinionClass.name);
        }
        
        return stats;
    }
    
    /**
     * Set button click handler
     * @param {Function} handler - Click handler function
     */
    onButtonClick(handler) {
        this.clickHandler = handler;
    }
    
    /**
     * Select a button
     * @param {string} minionType - Minion type to select
     */
    selectButton(minionType) {
        this.buttons.forEach((button, type) => {
            if (type === minionType) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
        });
    }
    
    /**
     * Deselect all buttons
     */
    deselectAll() {
        this.buttons.forEach(button => {
            button.classList.remove('selected');
        });
    }
    
    /**
     * Destroy button manager
     */
    destroy() {
        this.buttons.clear();
        this.clickHandler = null;
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

/**
 * FloatingTextManager - Manages floating text effects
 */
class FloatingTextManager {
    constructor() {
        this.activeTexts = new Set();
    }
    
    /**
     * Show floating text with flexible configuration
     * @param {Object} config - Configuration object
     * @param {string} config.text - Text to display
     * @param {number} [config.x=window.innerWidth/2] - X position
     * @param {number} [config.y=window.innerHeight/2] - Y position
     * @param {string} [config.color='#ffffff'] - Text color
     * @param {number} [config.duration=1000] - Duration in ms
     * @param {string} [config.font='24px Arial'] - Font style
     * @param {string} [config.effect='fade'] - Animation effect
     * @param {Object} [config.animation={}] - Custom animation properties
     */
    show(config) {
        const {
            text,
            x = window.innerWidth / 2,
            y = window.innerHeight / 2,
            color = '#ffffff',
            duration = 1000,
            font = '24px Arial',
            effect = 'fade',
            animation = {}
        } = config;
        
        const element = this.createElement(text, x, y, color, font);
        this.activeTexts.add(element);
        
        document.body.appendChild(element);
        
        // Apply animation
        this.animateElement(element, effect, duration, animation);
        
        // Clean up after animation
        setTimeout(() => {
            this.removeElement(element);
        }, duration);
    }
    
    /**
     * Create floating text element
     * @param {string} text - Text content
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Text color
     * @param {string} font - Font style
     * @returns {HTMLElement} Text element
     */
    createElement(text, x, y, color, font) {
        const element = document.createElement('div');
        element.textContent = text;
        
        const fontSize = font.split(' ')[0];
        const fontFamily = font.split(' ').slice(1).join(' ') || 'Arial';
        
        Object.assign(element.style, {
            position: 'fixed',
            left: x + 'px',
            top: y + 'px',
            color: color,
            fontSize: fontSize,
            fontFamily: fontFamily,
            fontWeight: 'bold',
            pointerEvents: 'none',
            zIndex: '1000',
            opacity: '1',
            transform: 'translateY(0)',
            transition: 'opacity 0.8s ease-out, transform 1s ease-out'
        });
        
        return element;
    }
    
    /**
     * Animate floating text element
     * @param {HTMLElement} element - Text element
     * @param {string} effect - Animation effect
     * @param {number} duration - Animation duration
     * @param {Object} customAnimation - Custom animation properties
     */
    animateElement(element, effect, duration, customAnimation) {
        requestAnimationFrame(() => {
            setTimeout(() => {
                switch (effect) {
                    case 'fade':
                        element.style.transform = 'translateY(-30px)';
                        element.style.opacity = '0';
                        break;
                    case 'grow':
                        element.style.transform = 'scale(1.5) translateY(-20px)';
                        element.style.opacity = '0';
                        break;
                    case 'slide':
                        element.style.transform = 'translateX(50px) translateY(-20px)';
                        element.style.opacity = '0';
                        break;
                    default:
                        // Apply custom animation
                        Object.assign(element.style, customAnimation);
                }
            }, 10);
        });
    }
    
    /**
     * Remove floating text element
     * @param {HTMLElement} element - Element to remove
     */
    removeElement(element) {
        if (element.parentNode) {
            document.body.removeChild(element);
        }
        this.activeTexts.delete(element);
    }
    
    /**
     * Clear all floating texts
     */
    clear() {
        this.activeTexts.forEach(element => {
            this.removeElement(element);
        });
    }
    
    /**
     * Destroy floating text manager
     */
    destroy() {
        this.clear();
    }
}