import 'package:flutter/foundation.dart';
import '../models/track.dart';

class DownloadManager extends ChangeNotifier {
  final List<Track> _downloadQueue = [];
  final List<Track> _completedDownloads = [];
  bool _isDownloading = false;
  double _currentProgress = 0.0;

  List<Track> get downloadQueue => _downloadQueue;
  List<Track> get completedDownloads => _completedDownloads;
  bool get isDownloading => _isDownloading;
  double get currentProgress => _currentProgress;

  void addToQueue(Track track) {
    _downloadQueue.add(track);
    notifyListeners();
  }

  void startBatchDownload() async {
    if (_downloadQueue.isEmpty) return;
    _isDownloading = true;
    notifyListeners();

    for (var track in List.from(_downloadQueue)) {
      _currentProgress = 0.0;
      for (int i = 0; i <= 10; i++) {
        await Future.delayed(const Duration(milliseconds: 200));
        _currentProgress = i / 10.0;
        notifyListeners();
      }
      _completedDownloads.add(track);
      _downloadQueue.remove(track);
    }

    _isDownloading = false;
    notifyListeners();
  }
}
