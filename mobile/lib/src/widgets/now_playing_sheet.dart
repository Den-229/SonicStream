import 'package:flutter/material.dart';
import '../models/track.dart';

class NowPlayingSheet extends StatefulWidget {
  final Track track;
  final bool isPlaying;
  final VoidCallback onPlayPause;
  final VoidCallback onDownload;

  const NowPlayingSheet({
    super.key,
    required this.track,
    required this.isPlaying,
    required this.onPlayPause,
    required this.onDownload,
  });

  @override
  State<NowPlayingSheet> createState() => _NowPlayingSheetState();
}

class _NowPlayingSheetState extends State<NowPlayingSheet> with SingleTickerProviderStateMixin {
  late AnimationController _rotationController;
  bool _isFavorite = false;
  double _currentPosition = 0.3;

  @override
  void initState() {
    super.initState();
    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 12),
    );
    if (widget.isPlaying) {
      _rotationController.repeat();
    }
  }

  @override
  void didUpdateWidget(covariant NowPlayingSheet oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isPlaying) {
      _rotationController.repeat();
    } else {
      _rotationController.stop();
    }
  }

  @override
  void dispose() {
    _rotationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: const BoxDecoration(
        color: Color(0xFF141417),
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Drag Handle bar
              Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 20),

              // Rotating Vinyl / Album Artwork Disc
              RotationTransition(
                turns: _rotationController,
                child: Container(
                  width: 160,
                  height: 160,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: const Color(0xFF18181B),
                    border: Border.all(color: const Color(0xFF10B981), width: 2),
                    boxShadow: const [
                      BoxShadow(color: Colors.black87, blurRadius: 20, offset: Offset(0, 10)),
                    ],
                  ),
                  child: Center(
                    child: Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFF10B981).withOpacity(0.2),
                        border: Border.all(color: const Color(0xFF10B981), width: 3),
                      ),
                      child: const Icon(Icons.music_note, color: Color(0xFF10B981), size: 24),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Track Title & Artist
              Text(
                widget.track.title,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Text(
                '${widget.track.artist} • Master Studio (320 kbps)',
                style: const TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),

              // Scrubber Slider
              SliderTheme(
                data: SliderThemeData(
                  activeTrackColor: const Color(0xFF10B981),
                  inactiveTrackColor: Colors.white12,
                  thumbColor: const Color(0xFF10B981),
                  overlayColor: const Color(0xFF10B981).withOpacity(0.2),
                  trackHeight: 3,
                ),
                child: Slider(
                  value: _currentPosition,
                  onChanged: (val) => setState(() => _currentPosition = val),
                ),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('01:14', style: TextStyle(color: Colors.grey, fontSize: 11)),
                    Text('03:45', style: TextStyle(color: Colors.grey, fontSize: 11)),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              // Playback Controls Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  IconButton(
                    icon: Icon(
                      _isFavorite ? Icons.favorite : Icons.favorite_border,
                      color: _isFavorite ? const Color(0xFFEC4899) : Colors.white60,
                    ),
                    onPressed: () => setState(() => _isFavorite = !_isFavorite),
                  ),
                  IconButton(
                    icon: const Icon(Icons.skip_previous, color: Colors.white, size: 28),
                    onPressed: () {},
                  ),
                  GestureDetector(
                    onTap: widget.onPlayPause,
                    child: Container(
                      width: 52,
                      height: 52,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Color(0xFF10B981),
                      ),
                      child: Icon(
                        widget.isPlaying ? Icons.pause : Icons.play_arrow,
                        color: Colors.black,
                        size: 28,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.skip_next, color: Colors.white, size: 28),
                    onPressed: () {},
                  ),
                  IconButton(
                    icon: const Icon(Icons.download, color: Colors.white60),
                    onPressed: widget.onDownload,
                  ),
                ],
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }
}
