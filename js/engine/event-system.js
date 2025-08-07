/**
 * EventSystem - Simple event bus for decoupled communication
 */
class EventSystem {
    constructor() {
        this.listeners = new Map();
    }
    
    /**
     * Subscribe to an event
     * @param {string} eventType - The event type to listen for
     * @param {Function} callback - The callback function
     * @param {Object} [context=null] - Optional context to bind callback to
     * @returns {Function} Unsubscribe function
     */
    on(eventType, callback, context = null) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        
        const listener = { callback, context };
        this.listeners.get(eventType).push(listener);
        
        // Return unsubscribe function
        return () => this.off(eventType, callback, context);
    }
    
    /**
     * Unsubscribe from an event
     * @param {string} eventType - The event type
     * @param {Function} callback - The callback function
     * @param {Object} [context=null] - Optional context
     */
    off(eventType, callback, context = null) {
        if (!this.listeners.has(eventType)) return;
        
        const listeners = this.listeners.get(eventType);
        const index = listeners.findIndex(l => 
            l.callback === callback && l.context === context
        );
        
        if (index !== -1) {
            listeners.splice(index, 1);
        }
        
        // Clean up empty listener arrays
        if (listeners.length === 0) {
            this.listeners.delete(eventType);
        }
    }
    
    /**
     * Emit an event
     * @param {string} eventType - The event type
     * @param {*} data - Data to pass to listeners
     */
    emit(eventType, data = null) {
        if (!this.listeners.has(eventType)) return;
        
        const listeners = this.listeners.get(eventType);
        listeners.forEach(({ callback, context }) => {
            try {
                if (context) {
                    callback.call(context, data);
                } else {
                    callback(data);
                }
            } catch (error) {
                console.error(`Error in event listener for ${eventType}:`, error);
            }
        });
    }
    
    /**
     * Subscribe to an event only once
     * @param {string} eventType - The event type
     * @param {Function} callback - The callback function
     * @param {Object} [context=null] - Optional context
     */
    once(eventType, callback, context = null) {
        const unsubscribe = this.on(eventType, (data) => {
            unsubscribe();
            if (context) {
                callback.call(context, data);
            } else {
                callback(data);
            }
        });
        
        return unsubscribe;
    }
    
    /**
     * Clear all listeners for an event type or all events
     * @param {string} [eventType] - Optional event type to clear
     */
    clear(eventType = null) {
        if (eventType) {
            this.listeners.delete(eventType);
        } else {
            this.listeners.clear();
        }
    }
    
    /**
     * Get listener count for debugging
     * @param {string} [eventType] - Optional event type
     * @returns {number} Number of listeners
     */
    getListenerCount(eventType = null) {
        if (eventType) {
            return this.listeners.has(eventType) ? this.listeners.get(eventType).length : 0;
        }
        
        let total = 0;
        for (const listeners of this.listeners.values()) {
            total += listeners.length;
        }
        return total;
    }
}

// Global event system instance
window.GameEvents = new EventSystem();