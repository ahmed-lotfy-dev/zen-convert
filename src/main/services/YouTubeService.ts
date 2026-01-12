import ytdl from 'youtube-dl-exec';
import { YouTubeVideoInfo } from '../../preload/ipc-types';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

export class YouTubeService {
  private log(message: string) {
    try {
      const logDir = app.getPath('userData');
      const logPath = path.join(logDir, 'youtube_debug.log');
      const timestamp = new Date().toISOString();
      if (message.includes('START')) console.log('[YouTubeService] LOG PATH:', logPath);
      fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
    } catch (e) {
      console.error('Logging failed', e);
    }
    console.log(message);
  }

  async getInfo(url: string): Promise<YouTubeVideoInfo> {
    this.log(`[YouTubeService] getInfo EXECUTION START for: ${url}`);
    try {
      if (!url) throw new Error('URL is required');

      // Diagnostic: Check binary
      this.log('[YouTubeService] Checking ytdl binary...');
      try {
        const version = await ytdl('--version', { noWarnings: true });
        this.log(`[YouTubeService] Binary check PASSED. Version: ${String(version).trim()}`);
      } catch (binError: any) {
        this.log(`[YouTubeService] Binary check FAILED: ${binError.message}`);
      }

      this.log('[YouTubeService] Executing ytdl fetch...');
      const info: any = await ytdl(url, {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
        addHeader: [
          'referer:youtube.com',
          'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ],
      });

      if (!info) throw new Error('ytdl returned empty response');
      
      this.log(`[YouTubeService] Fetch successful: ${info.title}`);

      return {
        id: info.id || '',
        title: info.title || 'Unknown Video',
        duration: info.duration || 0,
        thumbnail: info.thumbnail || '',
        uploader: info.uploader || 'Unknown',
        views: info.view_count || 0,
        description: info.description || '',
        formats: (info.formats || []).map((f: any) => ({
          formatId: f.format_id,
          extension: f.ext,
          resolution: f.resolution || (f.width ? `${f.width}x${f.height}` : undefined),
          filesize: f.filesize || f.filesize_approx,
          hasVideo: f.vcodec !== 'none',
          hasAudio: f.acodec !== 'none',
        })),
      };
    } catch (error: any) {
      this.log(`[YouTubeService] FATAL ERROR: ${JSON.stringify(error, null, 2)}`);
      
      let errorMessage = 'Unknown error';
      if (error.stderr) errorMessage = error.stderr;
      else if (error.message) errorMessage = error.message;
      else errorMessage = String(error);

      // Extract specific hints from ytdl stderr
      if (errorMessage.includes('Sign in to confirm you are not a bot')) {
        errorMessage = "YouTube is blocking the request (Bot Detection). Please try again in 5 minutes.";
      } else if (errorMessage.includes('Video unavailable')) {
        errorMessage = "The video is private or unavailable.";
      }

      this.log(`[YouTubeService] Refined Error for UI: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  }

  async download(url: string, format: 'mp4' | 'mp3', outputPath?: string): Promise<string> {
    const finalPath = outputPath || path.join(app.getPath('downloads'), `zenconvert_${Date.now()}.${format}`);
    
    try {
      const options: any = {
        output: finalPath,
        noCheckCertificates: true,
      };

      if (format === 'mp3') {
        options.extractAudio = true;
        options.audioFormat = 'mp3';
        options.audioQuality = 0;
      } else {
        options.format = 'bestvideo+bestaudio/best';
        options.mergeOutputFormat = 'mp4';
      }

      await ytdl(url, options);
      return finalPath;
    } catch (error) {
      console.error('YouTube download error:', error);
      throw error;
    }
  }
}
