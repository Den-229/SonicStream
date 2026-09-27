import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/track.dart';
import '../widgets/track_tile.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _controller = TextEditingController();
  List<Track> _results = [];
  bool _isLoading = false;

  void _performSearch() async {
    if (_controller.text.trim().isEmpty) return;
    setState(() => _isLoading = true);
    final results = await ApiService.searchTracks(_controller.text.trim());
    setState(() {
      _results = results;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Recherche Avancée'),
        backgroundColor: const Color(0xFF09090B),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _controller,
              onSubmitted: (_) => _performSearch(),
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Rechercher titre ou artiste...',
                hintStyle: const TextStyle(color: Colors.grey),
                prefixIcon: const Icon(Icons.search, color: Color(0xFF10B981)),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.send, color: Color(0xFF10B981)),
                  onPressed: _performSearch,
                ),
                filled: true,
                fillColor: const Color(0xFF141417),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 16),
            if (_isLoading)
              const CircularProgressIndicator(color: Color(0xFF10B981))
            else
              Expanded(
                child: _results.isEmpty
                    ? const Center(
                        child: Text(
                          'Tapez une recherche pour démarrer.',
                          style: TextStyle(color: Colors.grey),
                          textAlign: TextAlign.center,
                        ),
                      )
                    : ListView.builder(
                        itemCount: _results.length,
                        itemBuilder: (context, index) {
                          return TrackTile(track: _results[index]);
                        },
                      ),
              ),
          ],
        ),
      ),
    );
  }
}
