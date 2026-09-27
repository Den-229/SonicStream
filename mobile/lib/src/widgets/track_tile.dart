import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/track.dart';
import '../services/download_manager.dart';

class TrackTile extends StatelessWidget {
  final Track track;

  const TrackTile({super.key, required this.track});

  @override
  Widget build(BuildContext context) {
    final downloadManager = Provider.of<DownloadManager>(context, listen: false);

    return Card(
      color: const Color(0xFF16112B),
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: const CircleAvatar(
          backgroundColor: Color(0xFF7928CA),
          child: Icon(Icons.audiotrack, color: Colors.white),
        ),
        title: Text(track.title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text('${track.artist} • ${track.duration} (${track.bitrate})'),
        trailing: IconButton(
          icon: const Icon(Icons.download, color: Color(0xFF00F2FE)),
          onPressed: () {
            downloadManager.addToQueue(track);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('${track.title} ajouté au téléchargement !')),
            );
          },
        ),
      ),
    );
  }
}
