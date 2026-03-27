// UBWENGE HUB — Flutter App
// Targets: iOS, Android, macOS (via Xcode)
// This app consumes the same backend API as the web frontend.
//
// Run:  flutter run
// iOS:  open ios/Runner.xcworkspace in Xcode

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() {
  runApp(const UbwengeHubApp());
}

// ── CONFIG ────────────────────────────────────────────────────────────────────

const String kApiBase = 'http://localhost:3000'; // Change to your deployed URL

// ── APP ROOT ──────────────────────────────────────────────────────────────────

class UbwengeHubApp extends StatelessWidget {
  const UbwengeHubApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'UBWENGE HUB',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF3B82F6),
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: const Color(0xFF0A0A0A),
        useMaterial3: true,
      ),
      home: const MainShell(),
    );
  }
}

// ── MAIN SHELL WITH BOTTOM NAV ────────────────────────────────────────────────

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  final List<Widget> _pages = const [
    HomeScreen(),
    FinanceScreen(),
    ProctorScreen(),
    TourScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (i) => setState(() => _currentIndex = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined),    selectedIcon: Icon(Icons.home),         label: 'Home'),
          NavigationDestination(icon: Icon(Icons.trending_up),      selectedIcon: Icon(Icons.trending_up),  label: 'Finance'),
          NavigationDestination(icon: Icon(Icons.verified_user_outlined), selectedIcon: Icon(Icons.verified_user), label: 'Proctor'),
          NavigationDestination(icon: Icon(Icons.map_outlined),     selectedIcon: Icon(Icons.map),          label: 'Tour'),
        ],
      ),
    );
  }
}

// ── HOME SCREEN ───────────────────────────────────────────────────────────────

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80, height: 80,
              decoration: BoxDecoration(color: const Color(0xFF3B82F6), borderRadius: BorderRadius.circular(20)),
              child: const Center(child: Text('U', style: TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold))),
            ),
            const SizedBox(height: 24),
            const Text('UBWENGE HUB', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold, letterSpacing: 4)),
            const SizedBox(height: 8),
            Text('The unified intelligence engine for Rwanda.', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 14)),
          ],
        ),
      ),
    );
  }
}

// ── FINANCE SCREEN ────────────────────────────────────────────────────────────

class FinanceScreen extends StatefulWidget {
  const FinanceScreen({super.key});

  @override
  State<FinanceScreen> createState() => _FinanceScreenState();
}

class _FinanceScreenState extends State<FinanceScreen> {
  bool _loading = false;
  Map<String, dynamic>? _result;

  Future<void> _runDemo() async {
    setState(() => _loading = true);
    try {
      final res = await http.post(
        Uri.parse('$kApiBase/api/finance/predict'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'transactions': [
            {'type': 'income',  'amount': 800000},
            {'type': 'expense', 'amount': 200000},
            {'type': 'expense', 'amount': 150000},
          ]
        }),
      );
      setState(() => _result = jsonDecode(res.body));
    } catch (e) {
      setState(() => _result = {'error': e.toString()});
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Finance AI'), backgroundColor: Colors.transparent),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            if (_result != null) ...[
              _KpiCard(label: 'Saving Allowance', value: '${(_result!['saving_allowance'] as num).toStringAsFixed(0)} RWF', color: Colors.green),
              const SizedBox(height: 12),
              _KpiCard(label: 'Wealth Trend', value: _result!['wealth_trend'] ?? '-', color: Colors.blue),
              const SizedBox(height: 12),
              _KpiCard(label: 'Poverty Risk', value: '${((_result!['poverty_probability'] as num) * 100).toStringAsFixed(1)}%', color: Colors.red),
              const SizedBox(height: 16),
              Text(_result!['recommendation'] ?? '', style: TextStyle(color: Colors.white.withOpacity(0.7))),
            ],
            const Spacer(),
            ElevatedButton.icon(
              onPressed: _loading ? null : _runDemo,
              icon: _loading ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.play_arrow),
              label: Text(_loading ? 'Analyzing...' : 'Run Demo Analysis'),
              style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(52)),
            ),
          ],
        ),
      ),
    );
  }
}

class _KpiCard extends StatelessWidget {
  final String label, value;
  final Color color;
  const _KpiCard({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white.withOpacity(0.05), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white.withOpacity(0.08))),
      child: Row(children: [
        Expanded(child: Text(label, style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12))),
        Text(value, style: TextStyle(color: color, fontSize: 20, fontWeight: FontWeight.bold)),
      ]),
    );
  }
}

// ── PROCTOR SCREEN ────────────────────────────────────────────────────────────

class ProctorScreen extends StatelessWidget {
  const ProctorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Proctor AI'), backgroundColor: Colors.transparent),
      body: Center(
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          const Icon(Icons.verified_user, size: 64, color: Color(0xFF3B82F6)),
          const SizedBox(height: 16),
          const Text('Proctor AI', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text('Camera-based exam integrity monitoring.\nComing soon on mobile.', textAlign: TextAlign.center, style: TextStyle(color: Colors.white.withOpacity(0.4))),
        ]),
      ),
    );
  }
}

// ── TOUR SCREEN ───────────────────────────────────────────────────────────────

class TourScreen extends StatefulWidget {
  const TourScreen({super.key});

  @override
  State<TourScreen> createState() => _TourScreenState();
}

class _TourScreenState extends State<TourScreen> {
  final _controller = TextEditingController();
  final List<Map<String, String>> _chat = [];
  bool _loading = false;

  Future<void> _send() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    setState(() { _chat.add({'role': 'user', 'text': text}); _loading = true; });
    _controller.clear();

    try {
      final res = await http.post(
        Uri.parse('$kApiBase/api/ai/chat'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'prompt': 'As a Rwanda tour guide, answer in both Kinyarwanda and English: $text', 'feature': 'tour'}),
      );
      final data = jsonDecode(res.body);
      final answer = data['candidates']?[0]?['content']?['parts']?[0]?['text'] ?? 'No response';
      setState(() => _chat.add({'role': 'ai', 'text': answer}));
    } catch (e) {
      setState(() => _chat.add({'role': 'ai', 'text': 'Error: ${e.toString()}'}));
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Rwanda AI Guide'), backgroundColor: Colors.transparent),
      body: Column(children: [
        Expanded(child: ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: _chat.length,
          itemBuilder: (_, i) {
            final msg = _chat[i];
            final isUser = msg['role'] == 'user';
            return Align(
              alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
              child: Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(12),
                constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
                decoration: BoxDecoration(
                  color: isUser ? const Color(0xFF3B82F6) : Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(msg['text']!, style: const TextStyle(color: Colors.white)),
              ),
            );
          },
        )),
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(children: [
            Expanded(child: TextField(controller: _controller, onSubmitted: (_) => _send(), decoration: InputDecoration(hintText: 'Ask about Rwanda...', filled: true, fillColor: Colors.white.withOpacity(0.05), border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none)))),
            const SizedBox(width: 8),
            IconButton.filled(onPressed: _loading ? null : _send, icon: _loading ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Icon(Icons.send)),
          ]),
        ),
      ]),
    );
  }
}
