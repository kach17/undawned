/**
 * TooltipManager - Handles display of tooltips for game elements
 */
class TooltipManager {
    constructor() {
        this.tooltip = document.getElementById('tooltip');
        
        if (!this.tooltip) {
            // Create the tooltip element if it doesn't exist
            this.tooltip = document.createElement('div');
            this.tooltip.id = 'tooltip';
            this.tooltip.className = 'tooltip';
            document.body.appendChild(this.tooltip);
        }
        
        this.visible = false;
        this.currentElement = null;
        this.setupEventListeners();
    }

    /**
     * Setup event listeners for tooltip display
     */
    setupEventListeners() {
        // Hide tooltip when clicking anywhere
        document.addEventListener('click', () => this.hide());
        
        // Hide tooltip when pressing escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hide();
            }
        });
    }

    /**
     * Show a tooltip for a minion
     * @param {HTMLElement} element - The element that triggered the tooltip
     * @param {Object} data - The data to display in the tooltip
     * @param {number} x - X coordinate to position the tooltip
     * @param {number} y - Y coordinate to position the tooltip
     */
    show(element, data, x, y) {
        if (!this.tooltip) return;
        
        this.currentElement = element;
        this.tooltip.innerHTML = this.createTooltipHTML(data);
        this.positionTooltip(x, y);
        this.tooltip.classList.add('visible');
        this.visible = true;
    }

    /**
     * Hide the tooltip
     */
    hide() {
        if (!this.tooltip || !this.visible) return;
        
        this.tooltip.classList.remove('visible');
        this.visible = false;
        this.currentElement = null;
    }

    /**
     * Position the tooltip on screen
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    positionTooltip(x, y) {
        if (!this.tooltip) return;
        
        const offset = 10;
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Adjust position to ensure tooltip stays within viewport
        let left = x + offset;
        let top = y + offset;
        
        if (left + tooltipRect.width > viewportWidth) {
            left = x - tooltipRect.width - offset;
        }
        
        if (top + tooltipRect.height > viewportHeight) {
            top = y - tooltipRect.height - offset;
        }
        
        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.top = `${top}px`;
    }

    /**
     * Create HTML for the tooltip
     * @param {Object} data - The data to display
     * @returns {string} HTML string for the tooltip
     */
    createTooltipHTML(data) {
        let html = `
            <div class="tooltip-title">${data.name}</div>
            <div class="tooltip-description">${data.description || ''}</div>
        `;

        // Add stats if available
        if (data.stats && Object.keys(data.stats).length > 0) {
            html += '<div class="tooltip-stats">';
            for (const [stat, value] of Object.entries(data.stats)) {
                if (value !== undefined && value !== null) {
                    html += `
                        <span class="tooltip-stat-name">${this.formatStatName(stat)}:</span>
                        <span class="tooltip-stat-value">${this.formatStatValue(stat, value)}</span>
                    `;
                }
            }
            html += '</div>';
        }

        // Add abilities if available
        if (data.abilities && data.abilities.length > 0) {
            data.abilities.forEach(ability => {
                html += `
                    <div class="tooltip-ability">
                        <div class="tooltip-ability-name">${ability.name}</div>
                        <div class="tooltip-description">${ability.description}</div>
                    </div>
                `;
            });
        }

        return html;
    }

    /**
     * Format stat name for display
     * @param {string} stat - The stat name
     * @returns {string} Formatted stat name
     */
    formatStatName(stat) {
        return stat
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    }

    /**
     * Format stat value for display
     * @param {string} stat - The stat name
     * @param {number|string} value - The stat value
     * @returns {string} Formatted stat value
     */
    formatStatValue(stat, value) {
        if (typeof value === 'number') {
            // Format numbers with 2 decimal places if needed
            return value % 1 === 0 ? value.toString() : value.toFixed(2);
        }
        return value;
    }
}
