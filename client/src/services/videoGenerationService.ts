import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { storage, db } from '../config/firebase';
import { UserMediaItem } from './userGalleryService';
import { VideoConfig } from '../components/VideoGeneratorModal';

export interface RecapVideoData {
  id: string;
  userId: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  sourceMedia: string[]; // IDs of source media items
  config: VideoConfig;
  createdAt: string;
  status: 'generating' | 'completed' | 'failed';
}

// Client-side video generation using Canvas and MediaRecorder
export const generateRecapVideo = async (
  userId: string,
  config: VideoConfig,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    onProgress?.(10);
    
    // Create canvas for video composition
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 1080;
    canvas.height = 1920; // Instagram story format
    
    // Setup MediaRecorder for video capture
    const stream = canvas.captureStream(30); // 30 FPS
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });
    
    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };
    
    onProgress?.(20);
    
    // Load and prepare media
    const loadedMedia = await Promise.all(
      config.selectedMedia.map(async (media) => {
        if (media.type === 'image') {
          return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = media.url;
          });
        }
        return null;
      })
    );
    
    onProgress?.(40);
    
    // Start recording
    mediaRecorder.start();
    
    // Calculate timing
    const slidesDuration = config.duration * 1000; // Convert to milliseconds
    const slideDuration = slidesDuration / config.selectedMedia.length;
    const fps = 30;
    const framesPerSlide = Math.floor((slideDuration / 1000) * fps);
    
    let currentFrame = 0;
    let currentSlideIndex = 0;
    
    // Animation loop
    const animate = () => {
      if (currentSlideIndex >= config.selectedMedia.length) {
        mediaRecorder.stop();
        return;
      }
      
      // Clear canvas
      ctx.fillStyle = getThemeBackground(config.theme);
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw current media
      const currentMedia = loadedMedia[currentSlideIndex];
      if (currentMedia) {
        drawMediaWithTransition(
          ctx,
          currentMedia,
          canvas.width,
          canvas.height,
          currentFrame,
          framesPerSlide,
          config.transition,
          config.theme
        );
      }
      
      // Draw title if provided
      if (config.title && currentSlideIndex === 0) {
        drawTitle(ctx, config.title, canvas.width, canvas.height, config.theme);
      }
      
      currentFrame++;
      
      // Move to next slide
      if (currentFrame >= framesPerSlide) {
        currentFrame = 0;
        currentSlideIndex++;
        onProgress?.(40 + (currentSlideIndex / config.selectedMedia.length) * 40);
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    // Wait for recording to complete
    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = async () => {
        try {
          onProgress?.(80);
          
          // Create video blob
          const videoBlob = new Blob(chunks, { type: 'video/webm' });
          
          // Upload to Firebase Storage
          const videoId = `recap_${Date.now()}`;
          const videoRef = ref(storage, `users/${userId}/recaps/${videoId}.webm`);
          
          await uploadBytes(videoRef, videoBlob);
          const videoUrl = await getDownloadURL(videoRef);
          
          onProgress?.(90);
          
          // Save metadata to Firestore
          const recapData: Omit<RecapVideoData, 'id'> = {
            userId,
            title: config.title || 'Wedding Recap',
            videoUrl,
            duration: config.duration,
            sourceMedia: config.selectedMedia.map(m => m.id),
            config,
            createdAt: new Date().toISOString(),
            status: 'completed'
          };
          
          await addDoc(collection(db, `users/${userId}/recaps`), recapData);
          
          onProgress?.(100);
          resolve(videoUrl);
        } catch (error) {
          reject(error);
        }
      };
      
      mediaRecorder.onerror = reject;
    });
    
  } catch (error) {
    console.error('Error generating video:', error);
    throw new Error('Failed to generate video');
  }
};

const getThemeBackground = (theme: string): string => {
  switch (theme) {
    case 'elegant':
      return 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
    case 'modern':
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    case 'romantic':
      return 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)';
    case 'minimal':
      return '#ffffff';
    default:
      return '#f5f5f5';
  }
};

const drawMediaWithTransition = (
  ctx: CanvasRenderingContext2D,
  media: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
  currentFrame: number,
  totalFrames: number,
  transition: string,
  theme: string
) => {
  const progress = currentFrame / totalFrames;
  
  // Calculate scaled dimensions to fit canvas while maintaining aspect ratio
  const mediaAspect = media.width / media.height;
  const canvasAspect = canvasWidth / canvasHeight;
  
  let drawWidth: number, drawHeight: number;
  if (mediaAspect > canvasAspect) {
    drawHeight = canvasHeight * 0.8; // Leave some margin
    drawWidth = drawHeight * mediaAspect;
  } else {
    drawWidth = canvasWidth * 0.8;
    drawHeight = drawWidth / mediaAspect;
  }
  
  const x = (canvasWidth - drawWidth) / 2;
  const y = (canvasHeight - drawHeight) / 2;
  
  ctx.save();
  
  // Apply transition effects
  switch (transition) {
    case 'fade':
      ctx.globalAlpha = Math.sin(progress * Math.PI);
      break;
    case 'slide':
      const slideX = x + (1 - Math.sin(progress * Math.PI / 2)) * canvasWidth;
      ctx.drawImage(media, slideX, y, drawWidth, drawHeight);
      ctx.restore();
      return;
    case 'zoom':
      const scale = 0.8 + 0.2 * Math.sin(progress * Math.PI);
      const scaledWidth = drawWidth * scale;
      const scaledHeight = drawHeight * scale;
      const scaledX = x + (drawWidth - scaledWidth) / 2;
      const scaledY = y + (drawHeight - scaledHeight) / 2;
      ctx.drawImage(media, scaledX, scaledY, scaledWidth, scaledHeight);
      ctx.restore();
      return;
  }
  
  // Draw rounded rectangle background
  const borderRadius = 20;
  ctx.fillStyle = theme === 'minimal' ? '#ffffff' : 'rgba(255, 255, 255, 0.9)';
  roundRect(ctx, x - 10, y - 10, drawWidth + 20, drawHeight + 20, borderRadius);
  ctx.fill();
  
  // Draw shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 10;
  
  // Draw media
  ctx.drawImage(media, x, y, drawWidth, drawHeight);
  
  ctx.restore();
};

const drawTitle = (
  ctx: CanvasRenderingContext2D,
  title: string,
  canvasWidth: number,
  canvasHeight: number,
  theme: string
) => {
  ctx.save();
  
  // Title styling based on theme
  const fontSize = theme === 'minimal' ? 48 : 56;
  const fontFamily = theme === 'elegant' ? 'serif' : 'sans-serif';
  
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Text shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;
  
  // Text color based on theme
  switch (theme) {
    case 'elegant':
      ctx.fillStyle = '#2d3748';
      break;
    case 'modern':
      ctx.fillStyle = '#ffffff';
      break;
    case 'romantic':
      ctx.fillStyle = '#744c27';
      break;
    default:
      ctx.fillStyle = '#1a202c';
  }
  
  ctx.fillText(title, canvasWidth / 2, 120);
  
  ctx.restore();
};

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};