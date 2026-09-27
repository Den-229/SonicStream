class Track {
  final String id;
  final String title;
  final String artist;
  final String duration;
  final String bitrate;
  final String size;
  final String streamUrl;
  final String source;

  Track({
    required this.id,
    required this.title,
    required this.artist,
    required this.duration,
    required this.bitrate,
    required this.size,
    required this.streamUrl,
    required this.source,
  });

  factory Track.fromJson(Map<String, dynamic> json) {
    final vid = json['id'] ?? '';
    final titleStr = json['title'] ?? 'Unknown Track';
    return Track(
      id: vid,
      title: titleStr,
      artist: json['artist'] ?? 'Official Artist',
      duration: json['duration'] ?? '3:30',
      bitrate: json['bitrate'] ?? '320kbps',
      size: json['size'] ?? '7.5 MB',
      streamUrl: json['streamUrl'] ?? 'http://localhost:5000/api/v1/download/file?vid=$vid&title=${Uri.encodeComponent(titleStr)}',
      source: json['source'] ?? 'YouTube Official',
    );
  }
}
