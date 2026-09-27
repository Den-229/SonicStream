import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'src/screens/main_navigation_screen.dart';
import 'src/services/download_manager.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => DownloadManager(),
      child: const SonicStreamApp(),
    ),
  );
}

class SonicStreamApp extends StatelessWidget {
  const SonicStreamApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SonicStream Mobile Studio',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF09090B),
        cardColor: const Color(0xFF141417),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF10B981),
          secondary: Color(0xFF6366F1),
          surface: Color(0xFF18181B),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF09090B),
          elevation: 0,
        ),
      ),
      home: const MainNavigationScreen(),
    );
  }
}
