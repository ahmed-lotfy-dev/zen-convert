use image::ImageReader;
use std::fs::File;
use std::io::BufWriter;
use std::path::Path;
use serde::Deserialize;
use ffmpeg_sidecar::{command::FfmpegCommand, download::auto_download};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Deserialize, Debug)]
struct ImageOptions {
    format: String,
    quality: Option<u8>,
    width: Option<u32>,
    height: Option<u32>,
    outputDirectory: Option<String>,
}

#[derive(Deserialize, Debug)]
struct SubtitleOptions {
    path: Option<String>,
    format: Option<String>, // "srt", "ass", "vtt"
    burnIn: bool, // true = burn into video, false = soft subtitle
    forceStyle: Option<String>, // For ASS styling
}

#[derive(Deserialize, Debug)]
struct VideoOptions {
    format: String, // "mp4", "webm", "mkv", "avi"
    quality: Option<u8>, // 1-100 (CRF for H.264)
    outputDirectory: Option<String>,
    resolution: Option<ResolutionOptions>,
    bitrate: Option<String>, // e.g., "5M"
    codec: Option<String>, // "libx264", "libx265", "libvpx-vp9"
    subtitle: Option<SubtitleOptions>,
    audioCodec: Option<String>, // "aac", "libopus", "libmp3lame"
}

#[derive(Deserialize, Debug)]
struct ResolutionOptions {
    width: Option<u32>,
    height: Option<u32>,
}

#[tauri::command]
fn convert_image(file_path: String, options: ImageOptions) -> Result<serde_json::Value, String> {
    println!("Converting image: {} with options: {:?}", file_path, options);

    let path = Path::new(&file_path);
    let img = ImageReader::open(path)
        .map_err(|e| format!("Failed to open file: {}", e))?
        .decode()
        .map_err(|e| format!("Failed to decode image: {}", e))?;

    let img = if let (Some(w), Some(h)) = (options.width, options.height) {
        img.resize_exact(w, h, image::imageops::FilterType::Lanczos3)
    } else if let Some(w) = options.width {
        img.resize(w, u32::MAX, image::imageops::FilterType::Lanczos3)
    } else if let Some(h) = options.height {
        img.resize(u32::MAX, h, image::imageops::FilterType::Lanczos3)
    } else {
        img
    };

    let ext = match options.format.as_str() {
        "jpeg" => "jpg",
        "avif" => "avif",
        "webp" => "webp",
        "png" => "png",
        "bmp" => "bmp",
        "ico" => "ico",
        "tiff" => "tiff",
        _ => "jpg",
    };
    
    let parent_dir = path.parent().ok_or("Invalid file path")?;
    let output_dir = if let Some(ref dir) = options.outputDirectory {
        Path::new(dir)
    } else {
        parent_dir
    };

    let file_name = path.file_stem().ok_or("Invalid file name")?;
    let output_path = output_dir.join(file_name).with_extension(ext);

    let output_file = File::create(&output_path)
        .map_err(|e| format!("Failed to create output file: {}", e))?;
    let mut writer = BufWriter::new(output_file);

    match options.format.as_str() {
        "jpg" | "jpeg" => {
            let quality = options.quality.unwrap_or(90);
            let mut encoder = image::codecs::jpeg::JpegEncoder::new_with_quality(&mut writer, quality);
            encoder.encode_image(&img).map_err(|e| format!("Failed to encode JPEG: {}", e))?;
        },
        "png" => {
            let encoder = image::codecs::png::PngEncoder::new(&mut writer);
            img.write_with_encoder(encoder).map_err(|e| format!("Failed to encode PNG: {}", e))?;
        },
        "webp" => {
            img.write_to(&mut writer, image::ImageFormat::WebP)
                .map_err(|e| format!("Failed to encode WebP: {}", e))?;
        },
        "avif" => {
            img.write_to(&mut writer, image::ImageFormat::Avif)
                .map_err(|e| format!("Failed to encode AVIF: {}", e))?;
        },
        "bmp" => {
            img.write_to(&mut writer, image::ImageFormat::Bmp)
                .map_err(|e| format!("Failed to encode BMP: {}", e))?;
        },
        "ico" => {
            img.write_to(&mut writer, image::ImageFormat::Ico)
                .map_err(|e| format!("Failed to encode ICO: {}", e))?;
        },
        "tiff" => {
            img.write_to(&mut writer, image::ImageFormat::Tiff)
                .map_err(|e| format!("Failed to encode TIFF: {}", e))?;
        },
        _ => {
            img.write_to(&mut writer, image::ImageFormat::Jpeg)
                .map_err(|e| format!("Failed to encode image: {}", e))?;
        }
    }

    Ok(serde_json::json!({ "success": true, "filePath": output_path }))
}

#[tauri::command]
fn get_youtube_info(url: String) -> Result<serde_json::Value, String> {
    println!("Getting YouTube info for: {}", url);
    // Mock response
    Ok(serde_json::json!({
        "success": true,
        "data": {
             "title": "Mock Video Title",
             "description": "This is a mock description from Tauri backend.",
             "thumbnail": "https://via.placeholder.com/640x360",
             "duration": 120,
             "uploader": "Mock Uploader"
        }
    }))
}

#[tauri::command]
fn download_youtube_video(url: String, format: String) -> Result<serde_json::Value, String> {
    println!("Downloading YouTube video: {} in format: {}", url, format);
    // Mock response
    Ok(serde_json::json!({ "success": true, "data": { "filePath": "/tmp/mock_download.mp4" } }))
}

#[tauri::command]
fn convert_video(file_path: String, options: VideoOptions) -> Result<serde_json::Value, String> {
    println!("Converting video: {} with options: {:?}", file_path, options);

    // Download FFmpeg if not available
    if let Err(e) = auto_download() {
        return Err(format!("Failed to download FFmpeg: {}", e));
    }

    let input_path = Path::new(&file_path);
    let parent_dir = input_path.parent().ok_or("Invalid file path")?;
    let output_dir = if let Some(ref dir) = options.outputDirectory {
        Path::new(dir)
    } else {
        parent_dir
    };

    let file_name = input_path.file_stem().ok_or("Invalid file name")?;
    let output_ext = match options.format.as_str() {
        "mp4" => "mp4",
        "webm" => "webm",
        "mkv" => "mkv",
        "avi" => "avi",
        _ => "mp4",
    };
    let output_path = output_dir.join(file_name).with_extension(output_ext);

    // Build FFmpeg command
    let mut cmd = FfmpegCommand::new();
    cmd.arg("-i").arg(&file_path);

    // Handle video codec
    let vcodec = options.codec.as_deref().unwrap_or("libx264");
    let quality = options.quality.unwrap_or(23); // Default CRF 23

    // Handle resolution
    if let Some(ref res) = options.resolution {
        if res.width.is_some() || res.height.is_some() {
            let scale_filter = if let (Some(w), Some(h)) = (res.width, res.height) {
                format!("scale={}:{}", w, h)
            } else if let Some(w) = res.width {
                format!("scale={}: -2", w)
            } else if let Some(h) = res.height {
                format!("scale=-2:{}", h)
            } else {
                String::new()
            };
            if !scale_filter.is_empty() {
                cmd.arg("-vf").arg(&scale_filter);
            }
        }
    }

    // Handle subtitles
    if let Some(ref sub) = options.subtitle {
        if let Some(ref sub_path) = sub.path {
            if sub.burnIn {
                // Burn subtitles into video
                let filter = if let Some(ref format) = sub.format {
                    match format.as_str() {
                        "ass" => {
                            if let Some(ref style) = sub.forceStyle {
                                format!("ass='{}':force_style='{}'", sub_path.replace('\\', "\\\\"), style)
                            } else {
                                format!("ass='{}'", sub_path.replace('\\', "\\\\"))
                            }
                        }
                        "vtt" => {
                            format!("subtitles='{}'", sub_path.replace('\\', "\\\\"))
                        }
                        _ => {
                            format!("subtitles='{}'", sub_path.replace('\\', "\\\\"))
                        }
                    }
                } else {
                    format!("subtitles='{}'", sub_path.replace('\\', "\\\\"))
                };

                // Combine with existing -vf if any
                // For now, we'll just use subtitles filter
                cmd.arg("-vf").arg(filter);
            } else {
                // Soft subtitle - add as track
                cmd.arg("-i").arg(sub_path);
                cmd.arg("-c:s").arg("mov_text");
                cmd.arg("-map").arg("0");
                cmd.arg("-map").arg("1");
            }
        }
    }

    // Set video codec and quality
    cmd.arg("-c:v").arg(vcodec);
    cmd.arg("-crf").arg(quality.to_string());

    // Set audio codec
    let acodec = options.audioCodec.as_deref().unwrap_or("aac");
    cmd.arg("-c:a").arg(acodec);

    // Set bitrate if specified
    if let Some(ref bitrate) = options.bitrate {
        cmd.arg("-b:v").arg(bitrate);
    }

    // Faststart for web streaming
    if options.format == "mp4" {
        cmd.arg("-movflags").arg("+faststart");
    }

    // Overwrite output file
    cmd.arg("-y");
    cmd.arg(&output_path);

    // Execute FFmpeg command
    let mut child = cmd.spawn().map_err(|e| format!("Failed to spawn FFmpeg: {}", e))?;

    // Wait for FFmpeg to complete
    let _ = child.wait().map_err(|e| format!("FFmpeg execution error: {}", e))?;

    let mut success = false;
    let mut error_msg = String::new();

    // Check if output file exists
    if output_path.exists() {
        success = true;
    } else {
        error_msg = "Output file was not created".to_string();
    }

    if success {
        Ok(serde_json::json!({
            "success": true,
            "filePath": output_path.display().to_string()
        }))
    } else {
        Err(error_msg)
    }
}

#[tauri::command]
fn get_video_info(file_path: String) -> Result<serde_json::Value, String> {
    println!("Getting video info for: {}", file_path);

    // Download FFmpeg if not available
    if let Err(e) = auto_download() {
        return Err(format!("Failed to download FFmpeg: {}", e));
    }

    let mut cmd = FfmpegCommand::new();
    cmd.arg("-i").arg(&file_path);

    // FFmpeg sends info to stderr, we need to capture it
    let mut child = cmd.spawn().map_err(|e| format!("Failed to spawn FFmpeg: {}", e))?;

    // Get stderr output (FFmpeg info goes there)
    let _ = child.wait().map_err(|e| format!("FFmpeg execution error: {}", e))?;

    let info = serde_json::json!({
        "success": true,
        "format": "unknown",
        "duration": 0,
        "width": 0,
        "height": 0,
        "videoCodec": "unknown",
        "audioCodec": "unknown"
    });

    // For now, return basic info
    // In a more sophisticated implementation, we'd parse stderr output

    Ok(info)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            convert_image,
            get_youtube_info,
            download_youtube_video,
            convert_video,
            get_video_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
