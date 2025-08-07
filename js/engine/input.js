/**
 * InputHandler - Manages all user input and UI interactions
 */
class InputHandler {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.ctx = game.ctx;
        
        // Input state
        this.mouse = {
            x: 0,
            y: 0,
            isDown: false,
            isDragging: false,
            dragStart: { x: 0, y: 0 },
            hoveredTile: null
        };
        
        // UI state
        this.uiState = {
            selectedMinion: null,
            hoveredMinion: null,
            showRangeIndicator: false,
            rangeIndicatorPos: null
        };
        
        // Initialize event listeners
        this.setupEventListeners();
    }
    
    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        
        // Touch events
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Keyboard events
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
    }
    
    /**
     * Convert screen coordinates to grid position
     */
    screenToGrid(x, y) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = x - rect.left;
        const canvasY = y - rect.top;
        
        const tileX = Math.floor(canvasX / this.game.tileWidth);
        const tileY = Math.floor(canvasY / this.game.laneHeight);
        
        return { x: tileX, y: tileY };
    }
    
    /**
     * Handle mouse movement
     */
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = event.clientX - rect.left;
        this.mouse.y = event.clientY - rect.top;
        
        // Update hovered tile
        const gridPos = this.screenToGrid(event.clientX, event.clientY);
        this.mouse.hoveredTile = gridPos;
        
        // Update range indicator position if a minion is selected
        if (this.uiState.selectedMinion) {
            this.uiState.rangeIndicatorPos = gridPos;
            this.uiState.showRangeIndicator = true;
        }
        
        // Handle dragging
        if (this.mouse.isDown) {
            const dx = this.mouse.x - this.mouse.dragStart.x;
            const dy = this.mouse.y - this.mouse.dragStart.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) { // Minimum distance to start dragging
                this.mouse.isDragging = true;
            }
        }
    }
    
    /**
     * Handle mouse down
     */
    handleMouseDown(event) {
        this.mouse.isDown = true;
        this.mouse.dragStart = { x: this.mouse.x, y: this.mouse.y };
        this.mouse.isDragging = false;
    }
    
    /**
     * Handle mouse up
     */
    handleMouseUp(event) {
        if (this.mouse.isDragging) {
            // Handle drag end if needed
        }
        this.mouse.isDown = false;
        this.mouse.isDragging = false;
    }
    
    /**
     * Handle mouse leave
     */
    handleMouseLeave() {
        this.mouse.isDown = false;
        this.mouse.isDragging = false;
        this.uiState.showRangeIndicator = false;
    }
    
    /**
     * Handle click
     */
    handleClick(event) {
        if (this.game.gameOver || this.mouse.isDragging) {
            this.mouse.isDragging = false;
            return;
        }
        
        const gridPos = this.screenToGrid(event.clientX, event.clientY);
        
        // If a minion is selected, try to place it
        if (this.uiState.selectedMinion) {
            // Pass the minion type from uiState to the game's selectedMinionType
            this.game.selectedMinionType = this.uiState.selectedMinion;
            // Place the minion with correct coordinates (x is tile, y is lane)
            const placed = this.game.placeMinionAt(gridPos.y, gridPos.x);
            
            if (placed) {
                // Deselect after successful placement
                this.deselectMinion();
            } else {
                console.log('Could not place minion');
            }
        }
    }
    
    /**
     * Handle touch start
     */
    handleTouchStart(event) {
        event.preventDefault();
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.handleMouseDown({
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: () => {}
            });
        }
    }
    
    /**
     * Handle touch move
     */
    handleTouchMove(event) {
        event.preventDefault();
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.handleMouseMove({
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: () => {}
            });
        }
    }
    
    /**
     * Handle touch end
     */
    handleTouchEnd(event) {
        event.preventDefault();
        if (event.changedTouches.length === 1) {
            const touch = event.changedTouches[0];
            this.handleMouseUp({
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: () => {}
            });
        }
    }
    
    /**
     * Handle key down
     */
    handleKeyDown(event) {
        // Handle keyboard shortcuts
        switch (event.key) {
            case 'Escape':
                this.deselectMinion();
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
                const index = parseInt(event.key) - 1;
                const buttons = document.querySelectorAll('.minion-button');
                if (buttons[index]) {
                    buttons[index].click();
                }
                break;
        }
    }
    
    /**
     * Handle key up
     */
    handleKeyUp(event) {
        // Handle key up events if needed
    }
    
    /**
     * Select a minion for placement
     */
    selectMinion(minionType) {
        this.uiState.selectedMinion = minionType;
        this.uiState.showRangeIndicator = true;
        
        // Also update the game's selected minion
        this.game.selectedMinionType = minionType;
        
        // Update UI to show selected state
        const buttons = document.querySelectorAll('.minion-button');
        buttons.forEach(button => {
            if (button.dataset.minionType === minionType) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
        });
    }
    
    /**
     * Deselect the current minion
     */
    deselectMinion() {
        this.uiState.selectedMinion = null;
        this.uiState.showRangeIndicator = false;
        
        // Update UI
        const buttons = document.querySelectorAll('.minion-button');
        buttons.forEach(button => button.classList.remove('selected'));
    }
    
    /**
     * Update input handler
     */
    update() {
        // Update any input-related state here
    }
    
    /**
     * Render input-related UI elements
     */
    render() {
        // Render range indicator if a minion is selected
        if (this.uiState.showRangeIndicator && this.uiState.rangeIndicatorPos) {
            const { x, y } = this.uiState.rangeIndicatorPos;
            const tileX = x * this.game.tileWidth;
            const tileY = y * this.game.laneHeight;
            
            // Draw range indicator (semi-transparent highlight)
            this.ctx.save();
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillStyle = this.game.canPlaceMinion(y, x) ? '#00ff00' : '#ff0000';
            this.ctx.fillRect(tileX, tileY, this.game.tileWidth, this.game.laneHeight);
            this.ctx.restore();
            
            // Draw border
            this.ctx.strokeStyle = this.game.canPlaceMinion(y, x) ? '#00ff00' : '#ff0000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(tileX, tileY, this.game.tileWidth, this.game.laneHeight);
        }
        
        // Draw hover effect
        if (this.mouse.hoveredTile) {
            const { x, y } = this.mouse.hoveredTile;
            const tileX = x * this.game.tileWidth;
            const tileY = y * this.game.laneHeight;
            
            this.ctx.save();
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([3, 3]);
            this.ctx.strokeRect(tileX, tileY, this.game.tileWidth, this.game.laneHeight);
            this.ctx.restore();
        }
    }
}
