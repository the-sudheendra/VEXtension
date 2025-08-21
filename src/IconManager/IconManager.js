// background.js - Chrome Extension Background Script

class ChromeIconManager {
  constructor() {
    this.animationInterval = null;
    this.currentAnimation = null;
    this.canvas = new OffscreenCanvas(128, 128);
    this.ctx = this.canvas.getContext('2d');
    this.defaultIcon = null;
    
    // Initialize with default icon
    this.init();
  }

  async init() {
    // Store the default icon
    this.defaultIcon = {
      '16': 'icons/icon16.png',
      '32': 'icons/icon32.png',
      '48': 'icons/icon48.png',
      '128': 'icons/icon128.png'
    };
  }

  // Set static icon from path or data URL
  async setStaticIcon(iconPath, sizes = null) {
    try {
      if (sizes) {
        await chrome.action.setIcon({ path: sizes });
      } else {
        await chrome.action.setIcon({ path: iconPath });
      }
      this.stopAnimation();
      return { success: true, message: 'Static icon set successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Set icon from ImageData
  async setImageDataIcon(imageData) {
    try {
      await chrome.action.setIcon({ imageData: imageData });
      this.stopAnimation();
      return { success: true, message: 'ImageData icon set successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Create emoji icon
  async setEmojiIcon(emoji, backgroundColor = '#ffffff', size = 128) {
    try {
      this.canvas.width = size;
      this.canvas.height = size;
      
      // Clear canvas and set background
      this.ctx.fillStyle = backgroundColor;
      this.ctx.fillRect(0, 0, size, size);
      
      // Draw emoji
      this.ctx.font = `${size * 0.7}px serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillStyle = '#000000';
      this.ctx.fillText(emoji, size / 2, size / 2);
      
      const imageData = this.ctx.getImageData(0, 0, size, size);
      await this.setImageDataIcon(imageData);
      
      return { success: true, message: `Emoji icon ${emoji} set successfully` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Create text-based icon
  async setTextIcon(text, options = {}) {
    const {
      backgroundColor = '#4285f4',
      textColor = '#ffffff',
      fontSize = 32,
      fontFamily = 'Arial, sans-serif',
      size = 128
    } = options;

    try {
      this.canvas.width = size;
      this.canvas.height = size;
      
      // Clear canvas and set background
      this.ctx.fillStyle = backgroundColor;
      this.ctx.fillRect(0, 0, size, size);
      
      // Draw text
      this.ctx.font = `${fontSize}px ${fontFamily}`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillStyle = textColor;
      this.ctx.fillText(text, size / 2, size / 2);
      
      const imageData = this.ctx.getImageData(0, 0, size, size);
      await this.setImageDataIcon(imageData);
      
      return { success: true, message: `Text icon "${text}" set successfully` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Create gradient icon
  async setGradientIcon(colors, direction = 'vertical', size = 128) {
    try {
      this.canvas.width = size;
      this.canvas.height = size;
      
      let gradient;
      if (direction === 'vertical') {
        gradient = this.ctx.createLinearGradient(0, 0, 0, size);
      } else if (direction === 'horizontal') {
        gradient = this.ctx.createLinearGradient(0, 0, size, 0);
      } else if (direction === 'diagonal') {
        gradient = this.ctx.createLinearGradient(0, 0, size, size);
      } else {
        gradient = this.ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
      }
      
      colors.forEach((color, index) => {
        gradient.addColorStop(index / (colors.length - 1), color);
      });
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, size, size);
      
      const imageData = this.ctx.getImageData(0, 0, size, size);
      await this.setImageDataIcon(imageData);
      
      return { success: true, message: 'Gradient icon set successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Animate between multiple icons
  async startIconAnimation(frames, interval = 500) {
    this.stopAnimation();
    
    if (!frames || frames.length === 0) {
      return { success: false, error: 'No frames provided for animation' };
    }

    let currentFrame = 0;
    this.currentAnimation = { frames, interval };
    
    const animate = async () => {
      try {
        const frame = frames[currentFrame];
        
        if (frame.type === 'emoji') {
          await this.setEmojiIcon(frame.emoji, frame.backgroundColor);
        } else if (frame.type === 'text') {
          await this.setTextIcon(frame.text, frame.options);
        } else if (frame.type === 'path') {
          await this.setStaticIcon(frame.path);
        } else if (frame.type === 'imageData') {
          await this.setImageDataIcon(frame.imageData);
        }
        
        currentFrame = (currentFrame + 1) % frames.length;
      } catch (error) {
        console.error('Animation frame error:', error);
      }
    };
    
    // Start animation
    animate();
    this.animationInterval = setInterval(animate, interval);
    
    return { success: true, message: `Animation started with ${frames.length} frames` };
  }

  // Stop current animation
  stopAnimation() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
      this.currentAnimation = null;
    }
  }

  // Create pulsing animation
  async startPulseAnimation(baseIcon, pulseColor = '#ff0000', speed = 1000) {
    const frames = [];
    const steps = 8;
    
    for (let i = 0; i < steps; i++) {
      const opacity = Math.sin((i / steps) * Math.PI);
      frames.push({
        type: 'custom',
        draw: async () => {
          this.canvas.width = 128;
          this.canvas.height = 128;
          
          // Draw base icon (simplified - you'd load actual image here)
          this.ctx.fillStyle = baseIcon.backgroundColor || '#4285f4';
          this.ctx.fillRect(0, 0, 128, 128);
          
          // Add pulse overlay
          this.ctx.fillStyle = pulseColor;
          this.ctx.globalAlpha = opacity;
          this.ctx.fillRect(0, 0, 128, 128);
          this.ctx.globalAlpha = 1;
          
          const imageData = this.ctx.getImageData(0, 0, 128, 128);
          await this.setImageDataIcon(imageData);
        }
      });
    }
    
    this.stopAnimation();
    let currentFrame = 0;
    
    const animate = async () => {
      await frames[currentFrame].draw();
      currentFrame = (currentFrame + 1) % frames.length;
    };
    
    animate();
    this.animationInterval = setInterval(animate, speed / steps);
    
    return { success: true, message: 'Pulse animation started' };
  }

  // Set notification badge-style icon
  async setNotificationIcon(count, options = {}) {
    const {
      backgroundColor = '#ff0000',
      textColor = '#ffffff',
      baseIcon = null,
      size = 128
    } = options;

    try {
      this.canvas.width = size;
      this.canvas.height = size;
      
      // Draw base icon or background
      if (baseIcon) {
        // Load and draw base icon (simplified)
        this.ctx.fillStyle = '#4285f4';
        this.ctx.fillRect(0, 0, size, size);
      } else {
        this.ctx.fillStyle = '#cccccc';
        this.ctx.fillRect(0, 0, size, size);
      }
      
      // Draw notification badge
      const badgeSize = size * 0.4;
      const badgeX = size - badgeSize;
      const badgeY = 0;
      
      this.ctx.fillStyle = backgroundColor;
      this.ctx.beginPath();
      this.ctx.arc(badgeX + badgeSize/2, badgeY + badgeSize/2, badgeSize/2, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw count text
      this.ctx.fillStyle = textColor;
      this.ctx.font = `${badgeSize * 0.6}px Arial, sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(
        count > 99 ? '99+' : count.toString(), 
        badgeX + badgeSize/2, 
        badgeY + badgeSize/2
      );
      
      const imageData = this.ctx.getImageData(0, 0, size, size);
      await this.setImageDataIcon(imageData);
      
      return { success: true, message: `Notification icon with count ${count} set successfully` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Reset to default icon
  async resetToDefault() {
    try {
      this.stopAnimation();
      await chrome.action.setIcon({ path: this.defaultIcon });
      return { success: true, message: 'Icon reset to default' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get current animation status
  getAnimationStatus() {
    return {
      isAnimating: !!this.animationInterval,
      currentAnimation: this.currentAnimation
    };
  }

  // Create rotating icon animation
  async startRotationAnimation(baseIcon, speed = 2000) {
    const frames = [];
    const steps = 12;
    
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      frames.push({
        type: 'rotation',
        angle: angle,
        draw: async () => {
          this.canvas.width = 128;
          this.canvas.height = 128;
          
          this.ctx.save();
          this.ctx.translate(64, 64);
          this.ctx.rotate(angle);
          this.ctx.translate(-64, -64);
          
          // Draw rotated icon (simplified)
          this.ctx.fillStyle = baseIcon.color || '#4285f4';
          this.ctx.fillRect(32, 32, 64, 64);
          
          this.ctx.restore();
          
          const imageData = this.ctx.getImageData(0, 0, 128, 128);
          await this.setImageDataIcon(imageData);
        }
      });
    }
    
    this.stopAnimation();
    let currentFrame = 0;
    
    const animate = async () => {
      await frames[currentFrame].draw();
      currentFrame = (currentFrame + 1) % frames.length;
    };
    
    animate();
    this.animationInterval = setInterval(animate, speed / steps);
    
    return { success: true, message: 'Rotation animation started' };
  }
}

// Initialize the icon manager
const iconManager = new ChromeIconManager();

// Message listener for popup communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    let response;
    
    switch (request.action) {
      case 'setEmojiIcon':
        response = await iconManager.setEmojiIcon(
          request.emoji, 
          request.backgroundColor
        );
        break;
        
      case 'setTextIcon':
        response = await iconManager.setTextIcon(
          request.text, 
          request.options
        );
        break;
        
      case 'setGradientIcon':
        response = await iconManager.setGradientIcon(
          request.colors, 
          request.direction
        );
        break;
        
      case 'startAnimation':
        response = await iconManager.startIconAnimation(
          request.frames, 
          request.interval
        );
        break;
        
      case 'startPulse':
        response = await iconManager.startPulseAnimation(
          request.baseIcon, 
          request.pulseColor, 
          request.speed
        );
        break;
        
      case 'startRotation':
        response = await iconManager.startRotationAnimation(
          request.baseIcon, 
          request.speed
        );
        break;
        
      case 'setNotificationIcon':
        response = await iconManager.setNotificationIcon(
          request.count, 
          request.options
        );
        break;
        
      case 'stopAnimation':
        iconManager.stopAnimation();
        response = { success: true, message: 'Animation stopped' };
        break;
        
      case 'resetIcon':
        response = await iconManager.resetToDefault();
        break;
        
      case 'getStatus':
        response = iconManager.getAnimationStatus();
        break;
        
      default:
        response = { success: false, error: 'Unknown action' };
    }
    
    sendResponse(response);
  })();
  
  return true; // Keep message channel open for async response
});