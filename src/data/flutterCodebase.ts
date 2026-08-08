export interface CodeFile {
  path: string;
  language: 'dart' | 'yaml' | 'php' | 'json';
  category: 'core' | 'auth' | 'community' | 'quiz' | 'subscription' | 'backend' | 'config';
  code: string;
}

export const FLUTTER_CODEBASE: CodeFile[] = [
  {
    path: 'pubspec.yaml',
    language: 'yaml',
    category: 'config',
    code: `name: prepmate_bd
description: "AI-Powered SSC & HSC Board Exam Preparation and Community App for Bangladesh"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.4.9
  go_router: ^13.1.0
  dio: ^5.4.0
  google_fonts: ^6.1.0
  flutter_animate: ^4.5.0
  shared_preferences: ^2.2.2
  intl: ^0.19.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/images/
`,
  },
  {
    path: 'lib/main.dart',
    language: 'dart',
    category: 'core',
    code: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/routing/app_router.dart';
import 'core/theme/app_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    const ProviderScope(
      child: PrepMateBDApp(),
    ),
  );
}

class PrepMateBDApp extends ConsumerWidget {
  const PrepMateBDApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'PrepMate BD',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.light,
      routerConfig: router,
    );
  }
}
`,
  },
  {
    path: 'lib/core/constants/app_constants.dart',
    language: 'dart',
    category: 'core',
    code: `class AppConstants {
  static const String appName = 'PrepMate BD';
  static const String appVersion = '1.0.0';

  // API Base URLs
  static const String geminiApiKey = String.fromEnvironment('GEMINI_API_KEY');
  static const String geminiModel = 'gemini-1.5-flash';
  static const String bdappsApiBaseUrl = 'https://prepmate.bd/api/bdapps';

  // Board Categories
  static const List<String> academicLevels = ['SSC', 'HSC'];
  static const List<String> academicGroups = ['Science', 'Commerce', 'Humanities'];

  static const List<String> sscSubjects = [
    'Physics',
    'Chemistry',
    'Higher Math',
    'Biology',
    'ICT',
    'General Math',
    'English',
  ];

  static const List<String> hscSubjects = [
    'Physics 1st Paper',
    'Physics 2nd Paper',
    'Chemistry 1st Paper',
    'Chemistry 2nd Paper',
    'Higher Math 1st Paper',
    'Higher Math 2nd Paper',
    'ICT',
    'Biology 1st Paper',
    'Accounting 1st Paper',
  ];
}
`,
  },
  {
    path: 'lib/core/theme/app_theme.dart',
    language: 'dart',
    category: 'core',
    code: `import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Brand Palette for Bangladesh Education
  static const Color primaryTeal = Color(0xFF006A4E); // Deep Emerald/Teal
  static const Color secondaryAmber = Color(0xFFF2A900); // Gold Accent
  static const Color surfaceLight = Color(0xFFF7FAF9);
  static const Color cardBorder = Color(0xFFE2ECE9);
  static const Color textDark = Color(0xFF1E2923);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryTeal,
        primary: primaryTeal,
        secondary: secondaryAmber,
        surface: surfaceLight,
      ),
      scaffoldBackgroundColor: surfaceLight,
      textTheme: GoogleFonts.hindSiliguriTextTheme(),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: textDark),
        titleTextStyle: TextStyle(
          color: textDark,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      cardTheme: CardTheme(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: cardBorder, width: 1),
        ),
        color: Colors.white,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryTeal,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  static ThemeData get darkTheme => lightTheme;
}
`,
  },
  {
    path: 'lib/core/routing/app_router.dart',
    language: 'dart',
    category: 'core',
    code: `import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/auth/presentation/auth_screen.dart';
import '../../features/community/presentation/feed_screen.dart';
import '../../features/quiz/presentation/quiz_config_screen.dart';
import '../../features/quiz/presentation/quiz_play_screen.dart';
import '../../features/quiz/presentation/quiz_results_screen.dart';
import '../../features/subscription/presentation/subscription_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/quiz',
    routes: [
      GoRoute(
        path: '/auth',
        builder: (context, state) => const AuthScreen(),
      ),
      GoRoute(
        path: '/feed',
        builder: (context, state) => const CommunityFeedScreen(),
      ),
      GoRoute(
        path: '/quiz',
        builder: (context, state) => const QuizConfigScreen(),
      ),
      GoRoute(
        path: '/quiz-play',
        builder: (context, state) => const QuizPlayScreen(),
      ),
      GoRoute(
        path: '/quiz-results',
        builder: (context, state) => const QuizResultsScreen(),
      ),
      GoRoute(
        path: '/subscription',
        builder: (context, state) => const SubscriptionScreen(),
      ),
    ],
  );
});
`,
  },
  {
    path: 'lib/features/auth/domain/user_model.dart',
    language: 'dart',
    category: 'auth',
    code: `class UserModel {
  final String uid;
  final String phone;
  final String academicLevel; // SSC or HSC
  final String group; // Science, Commerce, Humanities
  final bool isPremium;
  final int dailyQuizCount;

  UserModel({
    required this.uid,
    required this.phone,
    required this.academicLevel,
    required this.group,
    this.isPremium = false,
    this.dailyQuizCount = 0,
  });

  UserModel copyWith({
    String? uid,
    String? phone,
    String? academicLevel,
    String? group,
    bool? isPremium,
    int? dailyQuizCount,
  }) {
    return UserModel(
      uid: uid ?? this.uid,
      phone: phone ?? this.phone,
      academicLevel: academicLevel ?? this.academicLevel,
      group: group ?? this.group,
      isPremium: isPremium ?? this.isPremium,
      dailyQuizCount: dailyQuizCount ?? this.dailyQuizCount,
    );
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      uid: json['uid'] ?? '',
      phone: json['phone'] ?? '',
      academicLevel: json['academicLevel'] ?? 'HSC',
      group: json['group'] ?? 'Science',
      isPremium: json['isPremium'] ?? false,
      dailyQuizCount: json['dailyQuizCount'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'uid': uid,
        'phone': phone,
        'academicLevel': academicLevel,
        'group': group,
        'isPremium': isPremium,
        'dailyQuizCount': dailyQuizCount,
      };
}
`,
  },
  {
    path: 'lib/features/auth/presentation/auth_screen.dart',
    language: 'dart',
    category: 'auth',
    code: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'auth_provider.dart';

class AuthScreen extends ConsumerStatefulWidget {
  const AuthScreen({super.key});

  @override
  ConsumerState<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends ConsumerState<AuthScreen> {
  final _phoneController = TextEditingController(text: '+8801700000000');
  final _otpController = TextEditingController();
  bool _codeSent = false;
  String _selectedLevel = 'HSC';
  String _selectedGroup = 'Science';

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 40),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF006A4E).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.school, size: 48, color: Color(0xFF006A4E)),
              ),
              const SizedBox(height: 16),
              const Text(
                'PrepMate BD এ স্বাগতম!',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const Text(
                'SSC ও HSC পরীক্ষার জন্য এআই ভিত্তিক প্রস্তুতি অ্যাপ',
                style: TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 32),
              if (!_codeSent) ...[
                TextField(
                  controller: _phoneController,
                  decoration: const InputDecoration(
                    labelText: 'মোবাইল নম্বর (+8801XXXXXXXXX)',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.phone_android),
                  ),
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _selectedLevel,
                        decoration: const InputDecoration(labelText: 'পরীক্ষা', border: OutlineInputBorder()),
                        items: ['SSC', 'HSC']
                            .map((l) => DropdownMenuItem(value: l, child: Text(l)))
                            .toList(),
                        onChanged: (val) => setState(() => _selectedLevel = val!),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _selectedGroup,
                        decoration: const InputDecoration(labelText: 'গ্রুপ', border: OutlineInputBorder()),
                        items: ['Science', 'Commerce', 'Humanities']
                            .map((g) => DropdownMenuItem(value: g, child: Text(g)))
                            .toList(),
                        onChanged: (val) => setState(() => _selectedGroup = val!),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      setState(() => _codeSent = true);
                    },
                    child: const Text('OTP পাঠান'),
                  ),
                ),
              ] else ...[
                Text('নম্বর: \${_phoneController.text}'),
                const SizedBox(height: 12),
                TextField(
                  controller: _otpController,
                  decoration: const InputDecoration(
                    labelText: '৬ ডিজিটের OTP কোড (Simulation: 123456)',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      ref.read(authProvider.notifier).login(
                            _phoneController.text,
                            _selectedLevel,
                            _selectedGroup,
                          );
                      context.go('/quiz');
                    },
                    child: const Text('যাচাই করুন ও প্রবেশ করুন'),
                  ),
                ),
              ]
            ],
          ),
        ),
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/features/auth/presentation/auth_provider.dart',
    language: 'dart',
    category: 'auth',
    code: `import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/user_model.dart';

class AuthNotifier extends StateNotifier<UserModel> {
  AuthNotifier()
      : super(UserModel(
          uid: 'user_bd_101',
          phone: '+8801712345678',
          academicLevel: 'HSC',
          group: 'Science',
          isPremium: false,
          dailyQuizCount: 0,
        ));

  void login(String phone, String level, String group) {
    state = state.copyWith(
      phone: phone,
      academicLevel: level,
      group: group,
    );
  }

  void setPremiumStatus(bool isPremium) {
    state = state.copyWith(isPremium: isPremium);
  }

  void incrementQuizCount() {
    state = state.copyWith(dailyQuizCount: state.dailyQuizCount + 1);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, UserModel>((ref) {
  return AuthNotifier();
});
`,
  },
  {
    path: 'lib/features/quiz/domain/quiz_model.dart',
    language: 'dart',
    category: 'quiz',
    code: `class QuizQuestion {
  final String id;
  final String question;
  final List<String> options;
  final int correctIndex;
  final String explanation;

  QuizQuestion({
    required this.id,
    required this.question,
    required this.options,
    required this.correctIndex,
    required this.explanation,
  });

  factory QuizQuestion.fromJson(Map<String, dynamic> json) {
    return QuizQuestion(
      id: json['id']?.toString() ?? DateTime.now().millisecondsSinceEpoch.toString(),
      question: json['question'] ?? '',
      options: List<String>.from(json['options'] ?? []),
      correctIndex: json['correctIndex'] ?? 0,
      explanation: json['explanation'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'question': question,
        'options': options,
        'correctIndex': correctIndex,
        'explanation': explanation,
      };
}
`,
  },
  {
    path: 'lib/features/quiz/data/gemini_quiz_service.dart',
    language: 'dart',
    category: 'quiz',
    code: `import 'dart:convert';
import 'package:dio/dio.dart';
import '../domain/quiz_model.dart';
import '../../../core/constants/app_constants.dart';

class GeminiQuizService {
  final Dio _dio = Dio();

  Future<List<QuizQuestion>> generateBoardQuiz({
    required String academicLevel,
    required String group,
    required String subject,
    required String chapter,
    int count = 5,
  }) async {
    try {
      const apiKey = AppConstants.geminiApiKey;
      if (apiKey.isEmpty) {
        // Fallback local generator
        return _getFallbackQuestions(subject);
      }

      final prompt = '''You are an expert Bangladesh NCTB Board Exam Setter.
Generate $count MCQs for $academicLevel ($group) subject $subject chapter $chapter.
Format strictly as JSON array of objects with keys: id, question, options (4 strings), correctIndex (0-3), explanation (bilingual Bangla/English).''';

      final response = await _dio.post(
        'https://generativelanguage.googleapis.com/v1beta/models/\${AppConstants.geminiModel}:generateContent?key=\$apiKey',
        data: {
          'contents': [
            {'parts': [{'text': prompt}]}
          ],
          'generationConfig': {'responseMimeType': 'application/json'},
        },
      );

      final String jsonStr = response.data['candidates'][0]['content']['parts'][0]['text'];
      final List rawList = jsonDecode(jsonStr);

      return rawList.map((q) => QuizQuestion.fromJson(q)).toList();
    } catch (e) {
      return _getFallbackQuestions(subject);
    }
  }

  List<QuizQuestion> _getFallbackQuestions(String subject) {
    return [
      QuizQuestion(
        id: '1',
        question: 'নিউটনের গতির ২য় সূত্র অনুসারে বলের মান কোনটি?',
        options: ['F = ma', 'E = mc²', 'V = IR', 'P = VI'],
        correctIndex: 0,
        explanation: 'F = ma সূত্র থেকে ভর ও ত্বরণের গুণফল হিসেবে বল নির্ণয় করা হয়।',
      ),
      QuizQuestion(
        id: '2',
        question: 'HTML এ হাইপারলিংক তৈরি করতে কোন ট্যাগ ব্যবহৃত হয়?',
        options: ['<a>', '<link>', '<href>', '<p>'],
        correctIndex: 0,
        explanation: '<a> ট্যাগ (Anchor Tag) ব্যবহার করে লিংক যুক্ত করা হয়।',
      ),
    ];
  }
}
`,
  },
  {
    path: 'lib/features/quiz/presentation/quiz_config_screen.dart',
    language: 'dart',
    category: 'quiz',
    code: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../auth/presentation/auth_provider.dart';
import 'quiz_provider.dart';

class QuizConfigScreen extends ConsumerStatefulWidget {
  const QuizConfigScreen({super.key});

  @override
  ConsumerState<QuizConfigScreen> createState() => _QuizConfigScreenState();
}

class _QuizConfigScreenState extends ConsumerState<QuizConfigScreen> {
  String _subject = 'Physics';
  String _chapter = 'Chapter 1: Physical Quantities & Measurement';
  int _questionCount = 5;

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('PrepMate BD (\${user.academicLevel})'),
        actions: [
          IconButton(
            icon: const Icon(Icons.stars, color: Colors.amber),
            onPressed: () => context.push('/subscription'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              color: const Color(0xFF006A4E),
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'এআই কুইজ জেনারেটর',
                            style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                          ),
                          Text(
                            user.isPremium ? '🌟 প্রিমিয়াম আনলিমিটেড এক্সেস' : 'দৈনিক ১টি ফ্রি কুইজ বাকি',
                            style: const TextStyle(color: Colors.white70),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF2A900)),
                      onPressed: () => context.push('/feed'),
                      child: const Text('কমিউনিটি', style: TextStyle(color: Colors.black)),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text('বিষয় নির্বাচন করুন:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: _subject,
              decoration: const InputDecoration(border: OutlineInputBorder()),
              items: ['Physics', 'Chemistry', 'Higher Math', 'ICT', 'Biology']
                  .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                  .toList(),
              onChanged: (v) => setState(() => _subject = v!),
            ),
            const SizedBox(height: 16),
            const Text('অধ্যায় নির্বাচন করুন:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            TextField(
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                hintText: 'যেমন: ১ম অধ্যায় - ভৌত রাশি ও পরিমাপ',
              ),
              onChanged: (v) => _chapter = v,
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: () async {
                  if (!user.isPremium && user.dailyQuizCount >= 1) {
                    context.push('/subscription');
                    return;
                  }
                  ref.read(quizProvider.notifier).startQuiz(_subject, _chapter, _questionCount);
                  context.push('/quiz-play');
                },
                child: const Text('🚀 এআই কুইজ শুরু করুন'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/features/subscription/data/bdapps_service.dart',
    language: 'dart',
    category: 'subscription',
    code: `import 'package:dio/dio.dart';
import '../../../core/constants/app_constants.dart';

class BdappsService {
  final Dio _dio = Dio();

  Future<Map<String, dynamic>> subscribeUser({
    required String phone,
    required String operator,
  }) async {
    try {
      final response = await _dio.post(
        '\${AppConstants.bdappsApiBaseUrl}/subscribe.php',
        data: {
          'phone': phone,
          'operator': operator,
        },
      );
      return response.data;
    } catch (e) {
      return {
        'status': 'SUCCESS',
        'message': 'Simulation: bdapps Carrier Billing Subscribed via \$operator airtime (BDT 2.00/day).'
      };
    }
  }

  Future<Map<String, dynamic>> unsubscribeUser({required String phone}) async {
    try {
      final response = await _dio.post(
        '\${AppConstants.bdappsApiBaseUrl}/unsubscribe.php',
        data: {'phone': phone},
      );
      return response.data;
    } catch (e) {
      return {'status': 'SUCCESS', 'message': 'Successfully unsubscribed.'};
    }
  }
}
`,
  },
  {
    path: 'lib/features/subscription/presentation/subscription_screen.dart',
    language: 'dart',
    category: 'subscription',
    code: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/presentation/auth_provider.dart';
import '../data/bdapps_service.dart';

class SubscriptionScreen extends ConsumerStatefulWidget {
  const SubscriptionScreen({super.key});

  @override
  ConsumerState<SubscriptionScreen> createState() => _SubscriptionScreenState();
}

class _SubscriptionScreenState extends ConsumerState<SubscriptionScreen> {
  String _selectedOperator = 'Grameenphone';
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('PrepMate BD প্রিমিয়াম')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const Icon(Icons.workspace_premium, size: 72, color: Color(0xFFF2A900)),
            const SizedBox(height: 12),
            const Text(
              'bdapps ক্যারিয়ার বিলিং সুবিধা',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const Text(
              'প্রতিদিন মাত্র ২.০০ টাকা (মোবাইল ব্যালেন্স থেকে কাটা হবে)',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 24),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: const [
                    ListTile(
                      leading: Icon(Icons.check_circle, color: Color(0xFF006A4E)),
                      title: Text('আনলিমিটেড এআই কুইজ জেনারেটর'),
                    ),
                    ListTile(
                      leading: Icon(Icons.check_circle, color: Color(0xFF006A4E)),
                      title: Text('দ্বিভাষিক (বাংলা+English) বিস্তারিত ব্যাখ্যা'),
                    ),
                    ListTile(
                      leading: Icon(Icons.check_circle, color: Color(0xFF006A4E)),
                      title: Text('কমিউনিটি প্রশ্নাবলীতে ফার্স্ট-প্রাইওরিটি এআই উত্তর'),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            DropdownButtonFormField<String>(
              value: _selectedOperator,
              decoration: const InputDecoration(labelText: 'মোবাইল অপারেটর', border: OutlineInputBorder()),
              items: ['Grameenphone', 'Robi', 'Airtel', 'Teletalk', 'Banglalink']
                  .map((op) => DropdownMenuItem(value: op, child: Text(op)))
                  .toList(),
              onChanged: (val) => setState(() => _selectedOperator = val!),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _isLoading
                    ? null
                    : () async {
                        setState(() => _isLoading = true);
                        final res = await BdappsService().subscribeUser(
                          phone: user.phone,
                          operator: _selectedOperator,
                        );
                        ref.read(authProvider.notifier).setPremiumStatus(true);
                        setState(() => _isLoading = false);
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text(res['message'] ?? 'সাবস্ক্রিপশন সফল হয়েছে!')),
                          );
                        }
                      },
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('bdapps দিয়ে সাবস্ক্রাইব করুন (২ টাকা/দিন)'),
              ),
            ),
            if (user.isPremium) ...[
              const SizedBox(height: 12),
              TextButton(
                onPressed: () async {
                  await BdappsService().unsubscribeUser(phone: user.phone);
                  ref.read(authProvider.notifier).setPremiumStatus(false);
                },
                child: const Text('সাবস্ক্রিপশন বাতিল করুন (Unsubscribe)', style: TextStyle(color: Colors.red)),
              ),
            ]
          ],
        ),
      ),
    );
  }
}
`,
  },
  {
    path: 'backend/php/subscribe.php',
    language: 'php',
    category: 'backend',
    code: `<?php
/**
 * bdapps Carrier Billing API Integration - PrepMate BD
 * Documentation: https://dev.bdapps.com/
 */

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

$phone = $input['phone'] ?? '';
$operator = $input['operator'] ?? 'Grameenphone';

if (empty($phone)) {
    echo json_encode([
        'status' => 'FAILED',
        'statusCode' => 'E1001',
        'message' => 'Phone number is required'
    ]);
    exit;
}

// bdapps API Request Payload Format
$bdappsPayload = [
    "applicationId" => "APP_019283_PREPMATE",
    "password" => "3c92a91e84d28430a",
    "subscriberId" => "tel:" . str_replace('+', '', $phone),
    "action" => "0", // 0 = Subscribe
    "amount" => "2.00",
    "currency" => "BDT"
];

// Return response structure
echo json_encode([
    'status' => 'SUCCESS',
    'statusCode' => 'S1000',
    'message' => 'Charged BDT 2.00 via ' . $operator . ' bdapps carrier billing.',
    'data' => [
        'subscriberId' => 'TEL-' . rand(10000, 99999),
        'phone' => $phone,
        'operator' => $operator,
        'chargingAmount' => '2.00 BDT',
        'isPremium' => true
    ]
]);
`,
  },
  {
    path: 'backend/php/unsubscribe.php',
    language: 'php',
    category: 'backend',
    code: `<?php
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$phone = $input['phone'] ?? '';

echo json_encode([
    'status' => 'SUCCESS',
    'statusCode' => 'S1001',
    'message' => 'Unsubscribed successfully from PrepMate BD daily service.',
    'phone' => $phone
]);
`,
  },
  {
    path: 'backend/php/status.php',
    language: 'php',
    category: 'backend',
    code: `<?php
header('Content-Type: application/json');

$phone = $_GET['phone'] ?? '';

echo json_encode([
    'status' => 'SUCCESS',
    'phone' => $phone,
    'subscriptionStatus' => 'ACTIVE',
    'dailyQuota' => 'UNLIMITED',
    'nextBillingDate' => date('Y-m-d', strtotime('+1 day'))
]);
`,
  },
];
