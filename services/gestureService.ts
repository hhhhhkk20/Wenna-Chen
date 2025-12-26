/**
 * A lightweight motion detection service.
 * Instead of loading heavy TensorFlow.js models, this uses pixel-difference 
 * analysis on the video feed to detect "Activity Level".
 * High activity (waving hands) -> Expands the tree.
 * Low activity (stillness) -> Collapses the tree.
 */

export class MotionDetector {
    private video: HTMLVideoElement | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private lastFrameData: Uint8ClampedArray | null = null;
    private width: number = 64; // Low res for performance
    private height: number = 48;
    private isActive: boolean = false;
  
    constructor() {
      this.width = 64;
      this.height = 48;
    }
  
    async start(videoElement: HTMLVideoElement) {
      this.video = videoElement;
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
      this.isActive = true;
    }
  
    stop() {
      this.isActive = false;
      this.lastFrameData = null;
    }
  
    // Returns a motion score from 0 to 1
    detect(): number {
      if (!this.isActive || !this.video || !this.ctx || this.video.readyState !== 4) return 0;
  
      // Draw current video frame to low-res canvas
      this.ctx.drawImage(this.video, 0, 0, this.width, this.height);
      const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
      const data = imageData.data;
      
      if (!this.lastFrameData) {
        this.lastFrameData = new Uint8ClampedArray(data);
        return 0;
      }
  
      let diffScore = 0;
      const length = data.length;
      // RGBA loop, skip Alpha (every 4th)
      // Check every 4th pixel to save CPU
      for (let i = 0; i < length; i += 16) { 
        const rDiff = Math.abs(data[i] - this.lastFrameData[i]);
        const gDiff = Math.abs(data[i+1] - this.lastFrameData[i+1]);
        const bDiff = Math.abs(data[i+2] - this.lastFrameData[i+2]);
        
        if (rDiff + gDiff + bDiff > 60) { // Threshold for "change"
          diffScore++;
        }
      }
  
      // Update last frame
      this.lastFrameData.set(data);
  
      // Normalize score based on resolution
      const totalPixels = (this.width * this.height) / 4; 
      // Sensitivity factor
      const normalized = Math.min(diffScore / (totalPixels * 0.1), 1.0); 
      
      return normalized;
    }
  }
  