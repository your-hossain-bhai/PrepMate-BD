export const flutterPubspec = `name: prepmate_bd
description: "PrepMate BD - SSC & HSC AI Board Exam Preparation App in Flutter"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter
  http: ^1.2.0
  shared_preferences: ^2.2.2
  flutter_local_notifications: ^17.0.0
  timezone: ^0.9.2
  provider: ^6.1.1
  google_fonts: ^6.1.0
  cupertino_icons: ^1.0.6

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/images/
`;

export const flutterMainDart = `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/notification_service.dart';
import 'services/offline_storage_service.dart';
import 'providers/user_provider.dart';
import 'screens/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await NotificationService().init();
  await OfflineStorageService().init();
  runApp(const PrepMateApp());
}

class PrepMateApp extends StatelessWidget {
  const PrepMateApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => UserProvider()..loadUserData()),
      ],
      child: MaterialApp(
        title: 'PrepMate BD',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          primaryColor: const Color(0xFF002B24),
          scaffoldBackgroundColor: const Color(0xFF00231D),
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFFFFC107),
            brightness: Brightness.dark,
          ),
          useMaterial3: true,
        ),
        home: const HomeScreen(),
      ),
    );
  }
}
`;

export const flutterUserModel = `class UserProfile {
  String name;
  String academicLevel; // SSC or HSC
  String group; // Science, Commerce, Humanities
  int xp;
  int streakDays;
  bool isPremium;
  String? reminderTime; // e.g. "20:00"
  bool reminderEnabled;

  UserProfile({
    required this.name,
    required this.academicLevel,
    required this.group,
    this.xp = 120,
    this.streakDays = 3,
    this.isPremium = false,
    this.reminderTime = '20:00',
    this.reminderEnabled = true,
  });

  Map<String, dynamic> toJson() => {
    'name': name,
    'academicLevel': academicLevel,
    'group': group,
    'xp': xp,
    'streakDays': streakDays,
    'isPremium': isPremium,
    'reminderTime': reminderTime,
    'reminderEnabled': reminderEnabled,
  };

  factory UserProfile.fromJson(Map<String, dynamic> json) => UserProfile(
    name: json['name'] ?? 'SSC Candidate',
    academicLevel: json['academicLevel'] ?? 'SSC',
    group: json['group'] ?? 'Science',
    xp: json['xp'] ?? 120,
    streakDays: json['streakDays'] ?? 3,
    isPremium: json['isPremium'] ?? false,
    reminderTime: json['reminderTime'] ?? '20:00',
    reminderEnabled: json['reminderEnabled'] ?? true,
  );
}
`;

export const flutterQuizModel = `class QuizQuestion {
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
      id: json['id'] ?? DateTime.now().millisecondsSinceEpoch.toString(),
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
`;

export const flutterApiService = `import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/quiz_model.dart';

class ApiService {
  // Replace with your production domain or local PHP server
  static const String baseUrl = 'https://yourdomain.com/api';

  // 1. Fetch AI Quiz Questions from Gemini API / Proxy Backend
  static Future<List<QuizQuestion>> generateQuiz({
    required String academicLevel,
    required String group,
    required String subject,
    required String chapter,
    required int count,
    required String language,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/quiz_generate.php'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'academicLevel': academicLevel,
        'group': group,
        'subject': subject,
        'chapter': chapter,
        'count': count,
        'language': language,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List list = data['questions'] ?? [];
      return list.map((q) => QuizQuestion.fromJson(q)).toList();
    } else {
      throw Exception('Failed to generate quiz from backend server');
    }
  }

  // 2. Verify Subscription via bKash/Nagad TrxID (PHP Backend Integration)
  static Future<Map<String, dynamic>> verifySubscription({
    required String phone,
    required String trxId,
    required String planId,
    required String paymentMethod,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/verify_subscription.php'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'phone': phone,
        'trxId': trxId,
        'planId': planId,
        'paymentMethod': paymentMethod,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      return {'success': false, 'message': 'Server connection failed'};
    }
  }
}
`;

export const flutterNotificationService = `import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tz_data;

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
      FlutterLocalNotificationsPlugin();

  Future<void> init() async {
    tz_data.initializeTimeZones();
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const InitializationSettings initializationSettings = InitializationSettings(
      android: initializationSettingsAndroid,
    );

    await flutterLocalNotificationsPlugin.initialize(initializationSettings);
  }

  Future<void> scheduleDailyStudyReminder(int hour, int minute) async {
    await flutterLocalNotificationsPlugin.cancelAll();

    const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      'prepmate_daily_reminder',
      'PrepMate Daily Reminders',
      channelDescription: 'Encourages daily SSC/HSC practice challenges',
      importance: Importance.max,
      priority: Priority.high,
    );

    const NotificationDetails notificationDetails = NotificationDetails(
      android: androidDetails,
    );

    final now = DateTime.now();
    var scheduledDate = DateTime(now.year, now.month, now.day, hour, minute);
    if (scheduledDate.isBefore(now)) {
      scheduledDate = scheduledDate.add(const Duration(days: 1));
    }

    await flutterLocalNotificationsPlugin.zonedSchedule(
      101,
      '🔥 PrepMate BD: Daily Study Challenge Ready!',
      'Don\\'t break your study streak! Tap now to complete today\\'s board exam challenge.',
      tz.TZDateTime.from(scheduledDate, tz.local),
      notificationDetails,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      matchDateTimeComponents: DateTimeComponents.time,
    );
  }
}
`;

export const phpDatabaseSql = `-- PHP MySQL Database Schema for PrepMate BD Subscriptions

CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`phone\` VARCHAR(15) UNIQUE NOT NULL,
  \`name\` VARCHAR(100),
  \`academic_level\` ENUM('SSC', 'HSC') DEFAULT 'SSC',
  \`is_premium\` TINYINT(1) DEFAULT 0,
  \`subscription_expires_at\` DATETIME NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`subscriptions\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`phone\` VARCHAR(15) NOT NULL,
  \`trx_id\` VARCHAR(50) UNIQUE NOT NULL,
  \`payment_method\` ENUM('bkash', 'nagad', 'rocket') NOT NULL,
  \`plan_id\` VARCHAR(20) NOT NULL,
  \`amount\` DECIMAL(10,2) NOT NULL,
  \`status\` ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

export const phpConfig = `<?php
// config.php - Database Configuration for PrepMate BD PHP Backend
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

$db_host = "localhost";
$db_user = "u948123_prepmate";
$db_pass = "YourStrongDbPass123!";
$db_name = "u948123_prepmate_db";

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}
?>
`;

export const phpVerifySubscription = `<?php
// verify_subscription.php - Handles bKash/Nagad Transaction Verification for Flutter App
require_once 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['phone']) || !isset($data['trxId']) || !isset($data['planId'])) {
    echo json_encode(["success" => false, "message" => "Invalid parameters provided"]);
    exit();
}

$phone = $conn->real_escape_string($data['phone']);
$trxId = strtoupper(trim($conn->real_escape_string($data['trxId'])));
$planId = $conn->real_escape_string($data['planId']);
$paymentMethod = isset($data['paymentMethod']) ? $conn->real_escape_string($data['paymentMethod']) : 'bkash';

// Determine amount based on plan
$amount = ($planId === 'yearly') ? 499.00 : 99.00;
$daysToAdd = ($planId === 'yearly') ? 365 : 30;

// Check for duplicate TrxID
$checkTrx = $conn->query("SELECT id FROM subscriptions WHERE trx_id = '$trxId'");
if ($checkTrx->num_rows > 0) {
    echo json_encode([
        "success" => false, 
        "message" => "This Transaction ID (TrxID) has already been used!"
    ]);
    exit();
}

// Insert transaction record
$sqlSub = "INSERT INTO subscriptions (phone, trx_id, payment_method, plan_id, amount, status) 
           VALUES ('$phone', '$trxId', '$paymentMethod', '$planId', $amount, 'approved')";

if ($conn->query($sqlSub)) {
    // Update or insert user premium status
    $expiryDate = date('Y-m-d H:i:s', strtotime("+$daysToAdd days"));
    
    $sqlUser = "INSERT INTO users (phone, is_premium, subscription_expires_at) 
                VALUES ('$phone', 1, '$expiryDate') 
                ON DUPLICATE KEY UPDATE is_premium = 1, subscription_expires_at = '$expiryDate'";
                
    $conn->query($sqlUser);

    echo json_encode([
        "success" => true,
        "message" => "Subscription activated successfully!",
        "isPremium" => true,
        "expiresAt" => $expiryDate
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Database error saving subscription"]);
}

$conn->close();
?>
`;

export interface FlutterCodeFile {
  path: string;
  category: 'core' | 'auth' | 'quiz' | 'community' | 'subscription' | 'backend';
  language: 'dart' | 'yaml' | 'php' | 'sql';
  code: string;
}

export const FLUTTER_CODEBASE: FlutterCodeFile[] = [
  {
    path: 'pubspec.yaml',
    category: 'core',
    language: 'yaml',
    code: flutterPubspec,
  },
  {
    path: 'lib/main.dart',
    category: 'core',
    language: 'dart',
    code: flutterMainDart,
  },
  {
    path: 'lib/models/user_model.dart',
    category: 'auth',
    language: 'dart',
    code: flutterUserModel,
  },
  {
    path: 'lib/models/quiz_model.dart',
    category: 'quiz',
    language: 'dart',
    code: flutterQuizModel,
  },
  {
    path: 'lib/services/api_service.dart',
    category: 'core',
    language: 'dart',
    code: flutterApiService,
  },
  {
    path: 'lib/services/notification_service.dart',
    category: 'core',
    language: 'dart',
    code: flutterNotificationService,
  },
  {
    path: 'php_backend/config.php',
    category: 'backend',
    language: 'php',
    code: phpConfig,
  },
  {
    path: 'php_backend/verify_subscription.php',
    category: 'backend',
    language: 'php',
    code: phpVerifySubscription,
  },
  {
    path: 'php_backend/database.sql',
    category: 'backend',
    language: 'sql',
    code: phpDatabaseSql,
  },
];
