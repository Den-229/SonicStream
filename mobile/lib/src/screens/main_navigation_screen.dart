import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:audioplayers/audioplayers.dart';
import '../services/api_service.dart';
import '../services/download_manager.dart';
import '../models/track.dart';
import '../widgets/audio_player_bar.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;
  final TextEditingController _searchController = TextEditingController();
  final AudioPlayer _audioPlayer = AudioPlayer();

  List<Track> _searchResults = [];
  bool _isLoading = false;
  String _selectedFilter = 'Tous';
  String _currentQuery = 'Dadju';

  // Pagination & Discography View
  bool _showFullDiscography = false;
  int _currentPage = 1;
  final int _itemsPerPage = 8;

  // Favorites
  final List<Track> _favorites = [];

  // Live Audio Player State
  Track? _activePlaying;
  bool _isPlaying = false;

  final List<String> _filters = ['Tous', 'Clip Officiel', 'Remix', 'Live'];

  @override
  void initState() {
    super.initState();
    _performSearch('Dadju');

    _audioPlayer.onPlayerStateChanged.listen((state) {
      if (mounted) {
        setState(() {
          _isPlaying = state == PlayerState.playing;
        });
      }
    });
  }

  @override
  void dispose() {
    _audioPlayer.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _performSearch(String query) async {
    if (query.trim().isEmpty) return;
    setState(() {
      _isLoading = true;
      _currentQuery = query;
      _currentPage = 1;
    });

    final results = await ApiService.searchTracks(query, filter: _selectedFilter);
    setState(() {
      _searchResults = results;
      _isLoading = false;
    });
  }

  void _togglePlay(Track track) async {
    if (_activePlaying?.id == track.id) {
      if (_isPlaying) {
        await _audioPlayer.pause();
      } else {
        await _audioPlayer.resume();
      }
    } else {
      setState(() {
        _activePlaying = track;
        _isPlaying = true;
      });
      try {
        await _audioPlayer.stop();
        await _audioPlayer.play(UrlSource(track.streamUrl));
      } catch (e) {
        print("Audio stream play error: $e");
      }
    }
  }

  void _toggleFavorite(Track track) {
    setState(() {
      if (_favorites.any((t) => t.id == track.id)) {
        _favorites.removeWhere((t) => t.id == track.id);
      } else {
        _favorites.add(track);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final downloadManager = Provider.of<DownloadManager>(context);

    // Pagination calculations
    final totalPages = (_searchResults.length / _itemsPerPage).ceil();
    final startIndex = (_currentPage - 1) * _itemsPerPage;
    final displayedTracks = _showFullDiscography
        ? _searchResults.skip(startIndex).take(_itemsPerPage).toList()
        : _searchResults.take(8).toList();

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: IndexedStack(
                index: _currentIndex,
                children: [
                  // TAB 0: ACCUEIL (HOME)
                  _buildHomeTab(),

                  // TAB 1: RECHERCHE & DISCOGRAPHIE (SEARCH)
                  _buildSearchTab(downloadManager, totalPages, displayedTracks),

                  // TAB 2: MA BIBLIOTHÈQUE (LIBRARY)
                  _buildLibraryTab(downloadManager),

                  // TAB 3: TÉLÉCHARGEMENTS (DOWNLOADS)
                  _buildDownloadsTab(downloadManager),
                ],
              ),
            ),

            // Persistent Audio Player Bar at bottom
            if (_activePlaying != null)
              AudioPlayerBar(
                track: _activePlaying!,
                isPlaying: _isPlaying,
                onPlayPause: () => _togglePlay(_activePlaying!),
                onDownload: () {
                  downloadManager.addToQueue(_activePlaying!);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      backgroundColor: const Color(0xFF10B981),
                      content: Text('${_activePlaying!.title} ajouté aux téléchargements !'),
                    ),
                  );
                },
              ),
          ],
        ),
      ),

      // Studio Bottom Navigation Bar
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        backgroundColor: const Color(0xFF09090B),
        selectedItemColor: const Color(0xFF10B981),
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        selectedFontSize: 12,
        unselectedFontSize: 12,
        items: const [
          BottomNavigationBarTypeItem(icon: Icon(Icons.compass_calibration), label: 'Accueil'),
          BottomNavigationBarTypeItem(icon: Icon(Icons.search), label: 'Recherche'),
          BottomNavigationBarTypeItem(icon: Icon(Icons.favorite), label: 'Bibliothèque'),
          BottomNavigationBarTypeItem(icon: Icon(Icons.download_for_offline), label: 'Stockage'),
        ].map((item) => BottomNavigationBarItem(icon: item.icon, label: item.label)).toList(),
      ),
    );
  }

  // Widget 1: Home Tab
  Widget _buildHomeTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // App Studio Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.music_note, color: Colors.black, size: 22),
                  ),
                  const SizedBox(width: 10),
                  const Text(
                    'SonicStream Studio',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF10B981).withOpacity(0.4)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.verified, color: Color(0xFF10B981), size: 14),
                    SizedBox(width: 4),
                    Text('HD Audio', style: TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Spotlight Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFF141417),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white10),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '★ ARTISTE À LA UNE',
                  style: TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                ),
                const SizedBox(height: 8),
                const Text('Dadju & Tayc — Héritage', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
                const SizedBox(height: 4),
                const Text('Écoutez l\'album officiel complet en qualité 320 kbps Master Studio.', style: TextStyle(color: Colors.grey, fontSize: 13)),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () {
                    setState(() {
                      _currentIndex = 1;
                      _showFullDiscography = true;
                    });
                    _performSearch('Dadju');
                  },
                  icon: const Icon(Icons.play_arrow),
                  label: const Text('Écouter la Discographie (30+ titres)', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          const Text('Artistes Populaires', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: ['Dadju', 'Burna Boy', 'Wizkid', 'Michael Jackson', 'Rema'].map((artist) {
                return GestureDetector(
                  onTap: () {
                    setState(() => _currentIndex = 1);
                    _performSearch(artist);
                  },
                  child: Container(
                    margin: const EdgeInsets.only(right: 12),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF141417),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white10),
                    ),
                    child: Row(
                      children: [
                        const CircleAvatar(
                          radius: 14,
                          backgroundColor: Color(0xFF10B981),
                          child: Icon(Icons.person, size: 16, color: Colors.black),
                        ),
                        const SizedBox(width: 8),
                        Text(artist, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  // Widget 2: Search Tab
  Widget _buildSearchTab(DownloadManager downloadManager, int totalPages, List<Track> displayedTracks) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Search Input Bar
          TextField(
            controller: _searchController,
            onSubmitted: (v) => _performSearch(v),
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              hintText: 'Rechercher un artiste (Dadju, Burna Boy)...',
              hintStyle: const TextStyle(color: Colors.grey),
              prefixIcon: const Icon(Icons.search, color: Color(0xFF10B981)),
              suffixIcon: IconButton(
                icon: const Icon(Icons.send, color: Color(0xFF10B981)),
                onPressed: () => _performSearch(_searchController.text),
              ),
              filled: true,
              fillColor: const Color(0xFF141417),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: const BorderSide(color: Colors.white10),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _filters.map((f) {
                final isSelected = _selectedFilter == f;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: ChoiceChip(
                    label: Text(f),
                    selected: isSelected,
                    selectedColor: const Color(0xFF10B981),
                    backgroundColor: const Color(0xFF141417),
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.black : Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                    onSelected: (val) {
                      setState(() => _selectedFilter = f);
                      _performSearch(_currentQuery);
                    },
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 20),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Discographie ($_currentQuery - ${_searchResults.length} titres)',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              if (_isLoading)
                const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF10B981)),
                ),
            ],
          ),
          const SizedBox(height: 12),

          // Track List
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: displayedTracks.length,
            itemBuilder: (context, index) {
              final track = displayedTracks[index];
              final isCurrentPlaying = _activePlaying?.id == track.id;
              final isFav = _favorites.any((t) => t.id == track.id);

              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                decoration: BoxDecoration(
                  color: isCurrentPlaying ? const Color(0xFF10B981).withOpacity(0.12) : const Color(0xFF141417),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isCurrentPlaying ? const Color(0xFF10B981) : Colors.white10,
                  ),
                ),
                child: ListTile(
                  leading: IconButton(
                    icon: Icon(
                      isCurrentPlaying && _isPlaying ? Icons.pause_circle_filled : Icons.play_circle_fill,
                      color: const Color(0xFF10B981),
                      size: 36,
                    ),
                    onPressed: () => _togglePlay(track),
                  ),
                  title: Text(
                    track.title,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: isCurrentPlaying ? const Color(0xFF10B981) : Colors.white,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  subtitle: Text('${track.artist} • ${track.duration}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: Icon(isFav ? Icons.favorite : Icons.favorite_border, color: isFav ? const Color(0xFFEC4899) : Colors.grey, size: 20),
                        onPressed: () => _toggleFavorite(track),
                      ),
                      IconButton(
                        icon: const Icon(Icons.download, color: Color(0xFF10B981), size: 20),
                        onPressed: () {
                          downloadManager.addToQueue(track);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              backgroundColor: const Color(0xFF10B981),
                              content: Text('${track.title} ajouté au téléchargement !'),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              );
            },
          ),

          // "Voir plus" Button
          if (!_showFullDiscography && _searchResults.length > 8)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 16.0),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () => setState(() => _showFullDiscography = true),
                  icon: const Icon(Icons.unfold_more),
                  label: Text('Voir plus de résultats (${_searchResults.length} chansons) →', style: const TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ),

          // Pagination Controls
          if (_showFullDiscography && totalPages > 1)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(
                    icon: const Icon(Icons.chevron_left, color: Color(0xFF10B981)),
                    onPressed: _currentPage > 1 ? () => setState(() => _currentPage--) : null,
                  ),
                  Text('Page $_currentPage / $totalPages', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                  IconButton(
                    icon: const Icon(Icons.chevron_right, color: Color(0xFF10B981)),
                    onPressed: _currentPage < totalPages ? () => setState(() => _currentPage++) : null,
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  // Widget 3: Library Tab
  Widget _buildLibraryTab(DownloadManager downloadManager) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Ma Bibliothèque Favoris', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 16),
          Expanded(
            child: _favorites.isEmpty
                ? const Center(
                    child: Text('Aucun titre favori enregistré.', style: TextStyle(color: Colors.grey)),
                  )
                : ListView.builder(
                    itemCount: _favorites.length,
                    itemBuilder: (context, index) {
                      final track = _favorites[index];
                      return ListTile(
                        tileColor: const Color(0xFF141417),
                        leading: const Icon(Icons.music_note, color: Color(0xFF10B981)),
                        title: Text(track.title, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                        subtitle: Text(track.artist, style: const TextStyle(color: Colors.grey)),
                        trailing: IconButton(
                          icon: const Icon(Icons.play_arrow, color: Color(0xFF10B981)),
                          onPressed: () => _togglePlay(track),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  // Widget 4: Downloads Tab
  Widget _buildDownloadsTab(DownloadManager downloadManager) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Gestionnaire de Stockage Local', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF141417),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3)),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Espace Musique Réservé', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                    Text('4.2 GB Libres', style: TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold)),
                  ],
                ),
                SizedBox(height: 8),
                LinearProgressIndicator(value: 0.25, color: Color(0xFF10B981), backgroundColor: Colors.white10),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: downloadManager.completedDownloads.isEmpty
                ? const Center(child: Text('Aucun téléchargement hors-ligne.', style: TextStyle(color: Colors.grey)))
                : ListView.builder(
                    itemCount: downloadManager.completedDownloads.length,
                    itemBuilder: (context, index) {
                      final track = downloadManager.completedDownloads[index];
                      return ListTile(
                        tileColor: const Color(0xFF141417),
                        leading: const Icon(Icons.check_circle, color: Color(0xFF10B981)),
                        title: Text(track.title, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                        subtitle: Text('${track.artist} • Fichier MP3 320k'),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

class BottomNavigationBarTypeItem {
  final Widget icon;
  final String label;
  const BottomNavigationBarTypeItem({required this.icon, required this.label});
}
