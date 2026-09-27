import 'package:flutter/material.dart';
import '../models/track.dart';
import 'now_playing_sheet.dart';

class AudioPlayerBar extends StatelessWidget {
  final Track track;
  final bool isPlaying;
  final VoidCallback onPlayPause;
  final VoidCallback onDownload;

  const AudioPlayerBar({
    super.key,
    required this.track,
    required this.isPlaying,
    required this.onPlayPause,
    required this.onDownload,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (_) => NowPlayingSheet(
            track: track,
            isPlaying: isPlaying,
            onPlayPause: onPlayPause,
            onDownload: onDownload,
          ),
        );
      },
      child: Container(
        height: 68,
        margin: const EdgeInsets.all(10),
        padding: const EdgeInsets.symmetric(horizontal: 14),
        decoration: BoxDecoration(
          color: const Color(0xFF141417),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3), width: 1),
          boxShadow: const [
            BoxShadow(color: Colors.black87, blurRadius: 16, offset: Offset(0, 4)),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                color: const Color(0xFF18181B),
                border: Border.all(color: const Color(0xFF10B981), width: 1),
              ),
              child: const Icon(Icons.music_note, color: Color(0xFF10B981), size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    track.title,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    '${track.artist} • 320k Studio',
                    style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            IconButton(
              icon: Icon(
                isPlaying ? Icons.pause_circle_filled : Icons.play_circle_fill,
                color: const Color(0xFF10B981),
                size: 36,
              ),
              onPressed: onPlayPause,
            ),
            IconButton(
              icon: const Icon(Icons.download_for_offline, color: Colors.white70, size: 24),
              onPressed: onDownload,
            ),
          ],
        ),
      ),
    );
  }
}
