/**
 * Renderer class - Handles all rendering operations for the game
 * Separates rendering logic from game state management
 */
class Renderer {
    /**
     * Create a new Renderer instance
     * @param {HTMLCanvasElement} canvas - The game canvas element
     * @param {Game} game - Reference to the game instance
     */
    constructor(canvas, game) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.game = game;
        
        // Cache frequently used values
        this.tileWidth = 0;
        this.laneHeight = 0;
        this.tileCount = game.tileCount;
        this.laneCount = game.laneCount;
    }

    /**
     * Update dimensions when canvas is resized
     */
    updateDimensions() {
        this.tileWidth = this.canvas.width / this.tileCount;
        this.laneHeight = this.canvas.height / this.laneCount;
    }

    /**
     * Clear the entire canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Draw the game background
     */
    drawBackground() {
        const ctx = this.ctx;
        
        // Fill with dark background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw a subtle grid pattern
        ctx.strokeStyle = '#16213e';
        ctx.lineWidth = 1;
        
        // Draw vertical lines
        for (let x = 0; x <= this.canvas.width; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= this.canvas.height; y += 20) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
    }

    /**
     * Draw the game grid
     */
    drawGrid() {
        const ctx = this.ctx;
        
        // Draw lane dividers
        ctx.strokeStyle = '#4a4a8f';
        ctx.lineWidth = 1;
        
        // Draw horizontal lines (lanes)
        for (let i = 0; i <= this.laneCount; i++) {
            const y = i * this.laneHeight;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
        
        // Draw vertical lines (tiles)
        for (let i = 0; i <= this.tileCount; i++) {
            const x = i * this.tileWidth;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }
        
        // Highlight castle area (leftmost column)
        ctx.fillStyle = 'rgba(156, 39, 176, 0.2)';
        ctx.fillRect(0, 0, this.tileWidth, this.canvas.height);
    }

    /**
     * Draw UI elements
     */
    drawUI() {
        const ctx = this.ctx;
        const padding = 10;
        const fontSize = 12;
        const lineHeight = 16;
        
        // Set common text properties
        ctx.font = `${fontSize}px 'Arial', sans-serif`;
        ctx.textBaseline = 'top';
        
        // Draw game info in top-left corner
        const infoX = padding;
        const infoY = padding;
        
        // Daen counter
        ctx.fillStyle = '#9c27b0';
        ctx.textAlign = 'left';
        ctx.font = `bold ${fontSize}px 'Arial', sans-serif`;
        ctx.fillText(`Daen: ${Math.floor(this.game.daen)}`, infoX, infoY);
        
        // Wave info below Daen counter
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`Wave: ${this.game.waveNumber}`, infoX, infoY + lineHeight);
        
        // Next wave timer to the right of wave info
        if (this.game.waveTimer > 0) {
            const timeToNextWave = Math.ceil(this.game.waveTimer / 1000);
            const timeText = `Next: ${timeToNextWave}s`;
            const metrics = ctx.measureText(`Wave: ${this.game.waveNumber}`);
            
            ctx.fillStyle = timeToNextWave <= 5 ? '#ff6b6b' : '#a0a0a0';
            ctx.fillText(timeText, infoX + metrics.width + 15, infoY + lineHeight);
        }
        
        // Selected minion info in bottom-left corner
        if (this.game.selectedMinionType) {
            const MinionClass = MinionRegistry[this.game.selectedMinionType];
            if (MinionClass) {
                const infoY = this.canvas.height - lineHeight * 3;
                
                // Background for better readability
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                const textWidth = ctx.measureText(`Selected: ${MinionClass.name}`).width + padding * 2;
                ctx.fillRect(padding, infoY - 2, textWidth, lineHeight * 2 + 4);
                
                // Minion info text
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'left';
                ctx.fillText(`Selected: ${MinionClass.name}`, padding * 2, infoY);
                ctx.fillText(`Cost: ${MinionClass.cost} Daen`, padding * 2, infoY + lineHeight);
            }
        }
    }

    /**
     * Draw pause overlay
     */
    drawPauseOverlay() {
        const ctx = this.ctx;
        
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Pause text centered on screen
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        
        // Smaller instruction text below
        ctx.font = '14px Arial';
        ctx.fillText('Press SPACE to resume', this.canvas.width / 2, this.canvas.height / 2 + 30);
    }

    /**
     * Draw game over overlay
     */
    drawGameOver() {
        const ctx = this.ctx;
        
        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Game over text
        ctx.fillStyle = '#ffffff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            this.game.victory ? 'VICTORY!' : 'GAME OVER',
            this.canvas.width / 2,
            this.canvas.height / 2 - 40
        );
        
        // Subtitle
        ctx.font = '24px Arial';
        ctx.fillText(
            this.game.victory ? 'The heroes have been defeated!' : 'The heroes have breached your castle!',
            this.canvas.width / 2,
            this.canvas.height / 2 + 20
        );
        
        // Restart button
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = (this.canvas.width - buttonWidth) / 2;
        const buttonY = this.canvas.height / 2 + 80;
        
        // Button background
        ctx.fillStyle = '#9c27b0';
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Button text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textBaseline = 'middle';
        ctx.fillText('PLAY AGAIN', this.canvas.width / 2, buttonY + buttonHeight / 2);
    }

    /**
     * Main render method
     */
    render() {
        // Clear the canvas
        this.clear();
        
        // Draw background and grid
        this.drawBackground();
        this.drawGrid();
        
        // Render all game objects through their respective render methods
        this.game.lanes.forEach(lane => {
            lane.render(this.ctx);
        });
        
        // Render input handler if it exists
        if (this.game.inputHandler) {
            this.game.inputHandler.render();
        }
        
        // Draw UI elements
        this.drawUI();
        
        // Draw game over or pause overlay if needed
        if (this.game.gameOver) {
            this.drawGameOver();
        } else if (this.game.isPaused) {
            this.drawPauseOverlay();
        }
    }

    /**
     * Display floating text at a position
     * @param {string} text - The text to display
     * @param {number} [x=this.canvas.width/2] - X position (centered by default)
     * @param {number} [y=this.canvas.height/2] - Y position (centered by default)
     * @param {string} [color='#ffffff'] - Text color
     * @param {number} [duration=1000] - Duration in ms
     * @param {string} [font='24px Arial'] - Font style
     * @param {string} [effect='none'] - Optional effect: 'fade', 'grow', or 'none'
     */
    showFloatingText(text, x = this.canvas.width/2, y = this.canvas.height/2, 
                     color = '#ffffff', duration = 1000, font = '24px Arial', effect = 'none') {
        // Create a new floating text element
        const element = document.createElement('div');
        element.textContent = text;
        element.style.position = 'absolute';
        element.style.left = x + 'px';
        element.style.top = y + 'px';
        element.style.color = color;
        element.style.fontWeight = 'bold';
        element.style.pointerEvents = 'none';
        element.style.transition = `opacity ${duration * 0.8}ms ease-out, transform ${duration}ms ease-out`;
        element.style.transform = 'translateY(0)';
        element.style.opacity = '1';
        element.style.zIndex = '1000';
        
        // Add to document
        document.body.appendChild(element);
        
        // Trigger animation
        requestAnimationFrame(() => {
            setTimeout(() => {
                element.style.transform = 'translateY(-30px)';
                element.style.opacity = '0';
                
                // Remove after animation
                setTimeout(() => {
                    if (element.parentNode) {
                        document.body.removeChild(element);
                    }
                }, duration);
            }, 10);
        });
    }
}
