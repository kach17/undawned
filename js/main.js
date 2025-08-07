/**
 * Main.js - Game initialization and setup
 */

// Game instance (global for debugging)
let game;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize game
    game = new Game('game-canvas');
    
    // Initialize input handler
    game.inputHandler = new InputHandler(game);
    
    // Initialize tooltip manager
    game.tooltipManager = new TooltipManager();
    
    // Create minion selection buttons
    createMinionButtons(game);
    
    // Start game loop
    game.start();
});

/**
 * Get minion stats for tooltip display
 * @param {Function} MinionClass - The minion class
 * @returns {Object} Stats object with minion information
 */
function getMinionStats(MinionClass) {
    // Create a temporary instance to get instance properties
    const tempInstance = new MinionClass(0, 0, null);
    
    return {
        name: MinionClass.name,
        description: MinionClass.description,
        cost: MinionClass.cost,
        stats: {
            'Health': tempInstance.health,
            'Damage': tempInstance.damage,
            'Attack Speed': tempInstance.attackSpeed.toFixed(1) + '/s',
            'Range': tempInstance.attackRange,
            'Move Speed': tempInstance.moveSpeed.toFixed(1)
        },
        abilities: [
            // Special abilities can be added here
            // Example:
            // {
            //     name: 'Special Ability',
            //     description: 'Does something special',
            //     cooldown: '10s'
            // }
        ]
    };
}

/**
 * Create minion selection buttons
 * @param {Game} game - The game instance
 */
function createMinionButtons(game) {
    const container = document.getElementById('minion-buttons');
    
    // Initialize tooltip manager if it doesn't exist
    if (!game.tooltipManager) {
        game.tooltipManager = new TooltipManager();
    }
    
    // Clear existing buttons
    container.innerHTML = '';
    
    // Create a button for each minion type
    let index = 0;
    for (const [type, MinionClass] of Object.entries(MinionRegistry)) {
        const button = document.createElement('div');
        button.className = 'minion-button';
        button.dataset.type = type;
        button.dataset.index = index++;
        
        // Set keyboard shortcut number
        const shortcut = (index).toString();
        button.dataset.shortcut = shortcut;
        
        // Get minion stats for tooltip
        const minionStats = getMinionStats(MinionClass);
        
        // Create button content
        button.innerHTML = `
            <div class="minion-icon" style="background-color: ${MinionClass.prototype.color}"></div>
            <div class="minion-info">
                <div class="minion-name">${MinionClass.name}</div>
                <div class="minion-cost">${MinionClass.cost} Daen</div>
            </div>
            <div class="minion-shortcut">${shortcut}</div>
        `;
        
        // Add click handler
        button.addEventListener('click', () => {
            // Toggle selection
            if (game.inputHandler.uiState.selectedMinion === type) {
                game.inputHandler.deselectMinion();
                return;
            }
            
            // Select this minion type
            game.inputHandler.selectMinion(type);
            
            // Update UI
            const buttons = document.querySelectorAll('.minion-button');
            buttons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
        });
        
        // Add tooltip events
        button.addEventListener('mousemove', (e) => {
            if (game.tooltipManager) {
                game.tooltipManager.show(button, minionStats, e.clientX + 10, e.clientY + 10);
            }
        });
        
        button.addEventListener('mouseenter', (e) => {
            if (game.inputHandler) {
                game.inputHandler.uiState.hoveredMinion = type;
            }
            if (game.tooltipManager) {
                game.tooltipManager.show(button, minionStats, e.clientX + 10, e.clientY + 10);
            }
        });
        
        button.addEventListener('mouseleave', () => {
            if (game.inputHandler) {
                game.inputHandler.uiState.hoveredMinion = null;
            }
            if (game.tooltipManager) {
                game.tooltipManager.hide();
            }
        });
        
        container.appendChild(button);
    }
}

// Handle window resize for responsive layout
window.addEventListener('resize', () => {
    if (game) {
        game.resizeCanvas();
    }
});