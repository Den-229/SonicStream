import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/download_manager.dart';

class DownloadQueueScreen extends StatelessWidget {
  const DownloadQueueScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final downloadManager = Provider.of<DownloadManager>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Gestionnaire de Téléchargements'),
        backgroundColor: const Color(0xFF090714),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Storage usage widget
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF16112B),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF7928CA).withOpacity(0.4)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Espace de Stockage Musique', style: TextStyle(fontWeight: FontWeight.bold)),
                      Text('42.8 GB libres', style: TextStyle(color: Color(0xFF00F2FE), fontSize: 12)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  LinearProgressIndicator(
                    value: 0.35,
                    backgroundColor: Colors.white10,
                    color: const Color(0xFF00F2FE),
                    borderRadius: BorderRadius.circular(4),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Fichier(s) en attente (${downloadManager.downloadQueue.length})',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                if (downloadManager.downloadQueue.isNotEmpty)
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFF007F),
                      foregroundColor: Colors.white,
                    ),
                    onPressed: () => downloadManager.startBatchDownload(),
                    icon: const Icon(Icons.download),
                    label: const Text('Lancer tout'),
                  ),
              ],
            ),
            const SizedBox(height: 12),

            Expanded(
              child: downloadManager.downloadQueue.isEmpty && downloadManager.completedDownloads.isEmpty
                  ? const Center(
                      child: Text('Aucun téléchargement en cours.', style: TextStyle(color: Colors.grey)),
                    )
                  : ListView(
                      children: [
                        ...downloadManager.downloadQueue.map((track) => ListTile(
                              tileColor: const Color(0xFF16112B),
                              leading: const Icon(Icons.hourglass_top, color: Color(0xFF00F2FE)),
                              title: Text(track.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                              subtitle: Text('${track.artist} • En attente'),
                            )),
                        if (downloadManager.completedDownloads.isNotEmpty) ...[
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 16.0),
                            child: Text('Musiques Téléchargées', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          ),
                          ...downloadManager.completedDownloads.map((track) => ListTile(
                                tileColor: const Color(0xFF16112B),
                                leading: const Icon(Icons.check_circle, color: Colors.green),
                                title: Text(track.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                                subtitle: Text('${track.artist} • Prêt hors-ligne (${track.size})'),
                              )),
                        ]
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
