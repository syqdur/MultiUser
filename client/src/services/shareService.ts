import { Story } from './liveService';

export interface ShareData {
  title: string;
  text: string;
  url: string;
  files?: File[];
}

export interface SharePlatform {
  name: string;
  icon: string;
  color: string;
  shareUrl: (data: ShareData) => string;
  supportsFiles?: boolean;
  mobileOnly?: boolean;
}

export const sharePlatforms: SharePlatform[] = [
  {
    name: 'WhatsApp',
    icon: 'whatsapp',
    color: 'bg-green-500 hover:bg-green-600',
    shareUrl: (data) => `https://wa.me/?text=${encodeURIComponent(`${data.text} ${data.url}`)}`,
  },
  {
    name: 'Instagram',
    icon: 'instagram',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    shareUrl: (data) => data.url,
    supportsFiles: true,
    mobileOnly: true,
  },
  {
    name: 'Facebook',
    icon: 'facebook',
    color: 'bg-blue-600 hover:bg-blue-700',
    shareUrl: (data) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}`,
  },
  {
    name: 'Twitter',
    icon: 'twitter',
    color: 'bg-blue-400 hover:bg-blue-500',
    shareUrl: (data) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.text)}&url=${encodeURIComponent(data.url)}`,
  },
  {
    name: 'Telegram',
    icon: 'telegram',
    color: 'bg-blue-500 hover:bg-blue-600',
    shareUrl: (data) => `https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.text)}`,
  },
  {
    name: 'LinkedIn',
    icon: 'linkedin',
    color: 'bg-blue-700 hover:bg-blue-800',
    shareUrl: (data) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}`,
  },
];

export class CrossPlatformShareService {
  private static instance: CrossPlatformShareService;

  public static getInstance(): CrossPlatformShareService {
    if (!CrossPlatformShareService.instance) {
      CrossPlatformShareService.instance = new CrossPlatformShareService();
    }
    return CrossPlatformShareService.instance;
  }

  public async shareStory(story: Story): Promise<boolean> {
    const shareData = this.prepareStoryShareData(story);

    // Try native sharing first (mobile devices)
    if (this.isNativeShareSupported() && this.isMobileDevice()) {
      try {
        await this.nativeShare(shareData);
        return true;
      } catch (error) {
        console.log('Native share failed, falling back to web sharing');
      }
    }

    // Fallback to web-based sharing
    return this.webShare(shareData);
  }

  public async shareStoryWithMedia(story: Story): Promise<boolean> {
    if (!this.isNativeShareSupported()) {
      // Download and copy link as fallback
      await this.downloadStoryMedia(story);
      await this.copyToClipboard(this.getStoryUrl(story.id));
      return true;
    }

    try {
      // Convert media URL to File object for native sharing
      const file = await this.urlToFile(story.mediaUrl, story);
      const shareData = {
        ...this.prepareStoryShareData(story),
        files: [file],
      };

      await this.nativeShare(shareData);
      return true;
    } catch (error) {
      console.error('Media sharing failed:', error);
      // Fallback to URL sharing
      return this.shareStory(story);
    }
  }

  public async shareToPlatform(story: Story, platformName: string): Promise<boolean> {
    const platform = sharePlatforms.find(p => p.name === platformName);
    if (!platform) return false;

    const shareData = this.prepareStoryShareData(story);
    
    if (platform.name === 'Instagram' && platform.supportsFiles) {
      // For Instagram, download the media and let user manually share
      await this.downloadStoryMedia(story);
      await this.copyToClipboard(shareData.url);
      return true;
    }

    // Open platform-specific share URL
    const shareUrl = platform.shareUrl(shareData);
    window.open(shareUrl, '_blank', 'width=600,height=400');
    return true;
  }

  public async copyStoryLink(story: Story): Promise<boolean> {
    const url = this.getStoryUrl(story.id);
    return this.copyToClipboard(url);
  }

  public async downloadStoryMedia(story: Story): Promise<boolean> {
    try {
      const response = await fetch(story.mediaUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const extension = story.mediaType === 'video' ? 'mp4' : 'jpg';
      const filename = `wedding-story-${story.userName}-${new Date(story.createdAt).toISOString().split('T')[0]}.${extension}`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Download failed:', error);
      return false;
    }
  }

  public getShareableStoryData(story: Story) {
    return {
      url: this.getStoryUrl(story.id),
      text: `Check out this wedding story by ${story.userName}! 💕`,
      title: `Wedding Story - ${story.userName}`,
      mediaUrl: story.mediaUrl,
      mediaType: story.mediaType,
      userName: story.userName,
      createdAt: story.createdAt,
    };
  }

  private prepareStoryShareData(story: Story): ShareData {
    return {
      title: `Wedding Story - ${story.userName}`,
      text: `Check out this wedding story by ${story.userName}! 💕`,
      url: this.getStoryUrl(story.id),
    };
  }

  private getStoryUrl(storyId: string): string {
    return `${window.location.origin}/story/${storyId}`;
  }

  private async nativeShare(data: ShareData): Promise<void> {
    if (!navigator.share) {
      throw new Error('Native sharing not supported');
    }

    await navigator.share({
      title: data.title,
      text: data.text,
      url: data.url,
      files: data.files,
    });
  }

  private webShare(data: ShareData): boolean {
    // Open generic share dialog or copy to clipboard
    if (this.copyToClipboard(data.url)) {
      this.showShareSuccessMessage();
      return true;
    }
    return false;
  }

  private async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      }
    } catch (error) {
      console.error('Clipboard copy failed:', error);
      return false;
    }
  }

  private async urlToFile(url: string, story: Story): Promise<File> {
    const response = await fetch(url);
    const blob = await response.blob();
    const extension = story.mediaType === 'video' ? 'mp4' : 'jpg';
    const filename = `wedding-story-${story.userName}.${extension}`;
    return new File([blob], filename, { type: blob.type });
  }

  private isNativeShareSupported(): boolean {
    return 'share' in navigator && 'canShare' in navigator;
  }

  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private showShareSuccessMessage(): void {
    // Create a temporary success message
    const message = document.createElement('div');
    message.textContent = 'Link copied to clipboard!';
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(message);
    setTimeout(() => {
      document.body.removeChild(message);
    }, 3000);
  }

  public getAvailablePlatforms(): SharePlatform[] {
    // Filter platforms based on device capabilities
    if (this.isMobileDevice()) {
      return sharePlatforms;
    } else {
      return sharePlatforms.filter(platform => !platform.mobileOnly);
    }
  }
}

// Export singleton instance
export const shareService = CrossPlatformShareService.getInstance();