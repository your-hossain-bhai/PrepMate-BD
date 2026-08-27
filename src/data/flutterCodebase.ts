export const flutterPubspec = `name: prepmate_bd
description: "PrepMate BD - SSC & HSC AI Board Exam Preparation App in Flutter with bdapps TAP API Carrier Billing"
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
  dio: ^5.4.0
  shared_preferences: ^2.2.2
  flutter_local_notifications: ^17.0.0
  timezone: ^0.9.2
  provider: ^6.1.1
  google_fonts: ^6.1.0
  cupertino_icons: ^1.0.6
  url_launcher: ^6.2.4

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/images/
    - assets/audio/
`;

export const flutterMainDart = `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/notification_service.dart';
import 'services/offline_storage_service.dart';
import 'providers/user_provider.dart';
import 'screens/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // 1. Initialize background notifications & alarms
  await NotificationService().init();
  
  // 2. Initialize local SharedPreferences and offline cache
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
          useMaterial3: true,
          primaryColor: const Color(0xFF002B24),
          scaffoldBackgroundColor: const Color(0xFF00231D),
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFFFFC107),
            brightness: Brightness.dark,
            background: const Color(0xFF00231D),
            surface: const Color(0xFF002B24),
          ),
          textTheme: const TextTheme(
            bodyLarge: TextStyle(color: Colors.white),
            bodyMedium: TextStyle(color: Color(0xFFE2E8F0)),
          ),
        ),
        home: const HomeScreen(),
      ),
    );
  }
}
`;

export const flutterBdappsService = `import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';

/// Official bdapps TAP API Carrier Billing Service (Robi Axiata / Airtel)
/// Documentation: https://dev.bdapps.com/API_Documentation/bdapps_tap_api.html
class BdappsService {
  // Replace with your production domain or API gateway proxy URL
  static const String apiBaseUrl = 'https://your-domain.com/api/bdapps';
  
  /// Helper to normalize phone number to bdapps tel URI format e.g. "tel:8801812345678"
  static String formatSubscriberId(String phone) {
    final clean = phone.replaceAll(RegExp(r'[^0-9]'), '');
    if (clean.startsWith('880')) {
      return 'tel:$clean';
    } else if (clean.startsWith('01')) {
      return 'tel:88$clean';
    }
    return 'tel:$clean';
  }

  /// 1. Request SMS OTP for carrier billing registration
  /// POST /subscription/otp/request
  static Future<Map<String, dynamic>> requestOtp({
    required String phone,
    String operator = 'Robi',
  }) async {
    try {
      final response = await http.post(
        Uri.parse('\$apiBaseUrl/otp/request'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'phone': phone,
          'operator': operator,
        }),
      );

      return jsonDecode(response.body);
    } catch (e) {
      return {
        'statusCode': 'E1000',
        'statusDetail': 'Network error reaching bdapps OTP gateway: \$e',
      };
    }
  }

  /// 2. Verify SMS OTP and activate subscription
  /// POST /subscription/otp/verify
  static Future<Map<String, dynamic>> verifyOtp({
    required String referenceNo,
    required String otp,
    required String phone,
    String operator = 'Robi',
  }) async {
    try {
      final response = await http.post(
        Uri.parse('\$apiBaseUrl/otp/verify'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'referenceNo': referenceNo,
          'otp': otp.trim(),
          'phone': phone,
          'operator': operator,
        }),
      );

      return jsonDecode(response.body);
    } catch (e) {
      return {
        'statusCode': 'E1000',
        'statusDetail': 'OTP Verification network failure: \$e',
      };
    }
  }

  /// 3. Direct Subscribe (Action 1)
  /// POST /subscription/send
  static Future<Map<String, dynamic>> directSubscribe({
    required String phone,
    String operator = 'Robi',
  }) async {
    try {
      final response = await http.post(
        Uri.parse('\$apiBaseUrl/subscribe'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'phone': phone,
          'operator': operator,
        }),
      );

      return jsonDecode(response.body);
    } catch (e) {
      return {
        'statusCode': 'E1000',
        'statusDetail': 'Subscription connection failed: \$e',
      };
    }
  }

  /// 4. Direct Unsubscribe (Action 0)
  /// POST /subscription/send
  static Future<Map<String, dynamic>> unsubscribe({
    required String phone,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('\$apiBaseUrl/unsubscribe'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'phone': phone}),
      );

      return jsonDecode(response.body);
    } catch (e) {
      return {
        'statusCode': 'E1000',
        'statusDetail': 'Unsubscribe connection failed: \$e',
      };
    }
  }

  /// 5. Query Subscription Status
  /// POST /subscription/getStatus
  static Future<Map<String, dynamic>> checkStatus({
    required String phone,
  }) async {
    try {
      final response = await http.get(
        Uri.parse('\$apiBaseUrl/status?phone=\${Uri.encodeComponent(phone)}'),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return {'isPremium': false};
    } catch (e) {
      return {'isPremium': false, 'error': e.toString()};
    }
  }

  /// Launch Native SMS app to subscribe via SMS (START PREP to 21213)
  static Future<void> launchSmsSubscription() async {
    final uri = Uri.parse('sms:21213?body=START%20PREP');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  /// Launch USSD Dialer (*21213*999#)
  static Future<void> launchUssdDialer() async {
    final uri = Uri.parse('tel:*21213*999%23');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }
}
`;

export const flutterOfflineStorageService = `import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/quiz_model.dart';
import '../models/user_model.dart';

/// Rock-solid persistent local storage service using SharedPreferences
/// Ensures community posts, quizzes, reminder settings, and streak stats are never lost
class OfflineStorageService {
  static final OfflineStorageService _instance = OfflineStorageService._internal();
  factory OfflineStorageService() => _instance;
  OfflineStorageService._internal();

  late SharedPreferences _prefs;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // 1. User Profile Persistence
  Future<void> saveUserProfile(UserProfile user) async {
    await _prefs.setString('prepmate_user_profile', jsonEncode(user.toJson()));
  }

  UserProfile? getUserProfile() {
    final raw = _prefs.getString('prepmate_user_profile');
    if (raw == null) return null;
    try {
      return UserProfile.fromJson(jsonDecode(raw));
    } catch (e) {
      return null;
    }
  }

  // 2. Offline Quiz Question Caching
  Future<void> cacheQuizQuestions(String subject, String chapter, List<QuizQuestion> questions) async {
    final key = 'cache_\${subject}_\$chapter'.toLowerCase().replaceAll(' ', '_');
    final list = questions.map((q) => q.toJson()).toList();
    await _prefs.setString(key, jsonEncode(list));
  }

  List<QuizQuestion> getCachedQuestions(String subject, String chapter) {
    final key = 'cache_\${subject}_\$chapter'.toLowerCase().replaceAll(' ', '_');
    final raw = _prefs.getString(key);
    if (raw == null) return [];
    try {
      final List list = jsonDecode(raw);
      return list.map((item) => QuizQuestion.fromJson(item)).toList();
    } catch (e) {
      return [];
    }
  }

  // 3. Persistent Community Posts
  Future<void> saveCommunityPosts(List<Map<String, dynamic>> posts) async {
    await _prefs.setString('prepmate_community_posts_v2', jsonEncode(posts));
  }

  List<Map<String, dynamic>> getCommunityPosts() {
    final raw = _prefs.getString('prepmate_community_posts_v2');
    if (raw == null) return [];
    try {
      final List list = jsonDecode(raw);
      return list.cast<Map<String, dynamic>>();
    } catch (e) {
      return [];
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

    const DarwinInitializationSettings initializationSettingsDarwin =
        DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const InitializationSettings initializationSettings = InitializationSettings(
      android: initializationSettingsAndroid,
      iOS: initializationSettingsDarwin,
    );

    await flutterLocalNotificationsPlugin.initialize(initializationSettings);
  }

  /// Trigger immediate celebratory reminder test
  Future<void> showTestNotification({required String academicLevel, required int streakDays}) async {
    const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      'prepmate_study_channel',
      'PrepMate Study Alerts',
      channelDescription: 'Daily exam motivation and streak preservation reminders',
      importance: Importance.max,
      priority: Priority.high,
      playSound: true,
      enableVibration: true,
    );

    const NotificationDetails notificationDetails = NotificationDetails(
      android: androidDetails,
    );

    await flutterLocalNotificationsPlugin.show(
      99,
      '🔥 PrepMate BD: \$academicLevel Challenge Ready!',
      'Keep your \$streakDays-day study streak alive! Return to practice today\\'s board exam MCQs.',
      notificationDetails,
    );
  }

  /// Schedule daily study alarm at specified HH:MM
  Future<void> scheduleDailyStudyReminder(int hour, int minute, String academicLevel) async {
    await flutterLocalNotificationsPlugin.cancel(101);

    const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      'prepmate_daily_reminder',
      'PrepMate Daily Reminders',
      channelDescription: 'Encourages daily SSC/HSC practice challenges',
      importance: Importance.max,
      priority: Priority.high,
      playSound: true,
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
      '🔥 PrepMate BD: \$academicLevel Daily Challenge!',
      'Your board exam MCQs for today are waiting. Ace your target GPA 5.00!',
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

export const flutterUserModel = `class UserProfile {
  String name;
  String phone;
  String academicLevel; // SSC or HSC
  String group; // Science, Commerce, Humanities
  int xp;
  int streakDays;
  bool isPremium;
  String? reminderTime; // e.g. "20:00"
  bool reminderEnabled;

  UserProfile({
    required this.name,
    this.phone = '+8801812345678',
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
    'phone': phone,
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
    phone: json['phone'] ?? '+8801812345678',
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

export const flutterSubscriptionScreen = `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/bdapps_service.dart';
import '../providers/user_provider.dart';

class SubscriptionScreen extends StatefulWidget {
  const SubscriptionScreen({super.key});

  @override
  State<SubscriptionScreen> createState() => _SubscriptionScreenState();
}

class _SubscriptionScreenState extends State<SubscriptionScreen> {
  String selectedOperator = 'Robi';
  final TextEditingController phoneController = TextEditingController(text: '+8801812345678');
  final TextEditingController otpController = TextEditingController();
  
  bool isLoading = false;
  bool isOtpSent = false;
  String referenceNo = '';
  String? simulationOtp;
  String statusMessage = '';
  bool isError = false;

  @override
  void initState() {
    super.initState();
    _checkStatus();
  }

  Future<void> _checkStatus() async {
    final res = await BdappsService.checkStatus(phone: phoneController.text);
    if (res['isPremium'] == true) {
      if (mounted) {
        Provider.of<UserProvider>(context, listen: false).setPremium(true);
      }
    }
  }

  Future<void> _requestOtp() async {
    setState(() {
      isLoading = true;
      statusMessage = '';
      isError = false;
    });

    final res = await BdappsService.requestOtp(
      phone: phoneController.text,
      operator: selectedOperator,
    );

    setState(() {
      isLoading = false;
      if (res['statusCode'] == 'S1000' || res['referenceNo'] != null) {
        isOtpSent = true;
        referenceNo = res['referenceNo'] ?? '';
        simulationOtp = res['simulationOtp'];
        statusMessage = 'bdapps SMS OTP sent to \${phoneController.text}.';
      } else {
        isError = true;
        statusMessage = res['statusDetail'] ?? res['message'] ?? 'OTP Request Failed';
      }
    });
  }

  Future<void> _verifyOtp() async {
    setState(() {
      isLoading = true;
      statusMessage = '';
      isError = false;
    });

    final res = await BdappsService.verifyOtp(
      referenceNo: referenceNo,
      otp: otpController.text,
      phone: phoneController.text,
      operator: selectedOperator,
    );

    setState(() {
      isLoading = false;
      if (res['statusCode'] == 'S1000' || res['subscriptionStatus'] == 'REGISTERED') {
        Provider.of<UserProvider>(context, listen: false).setPremium(true);
        isOtpSent = false;
        statusMessage = '🎉 bdapps Carrier Subscription Activated Successfully!';
      } else {
        isError = true;
        statusMessage = res['statusDetail'] ?? 'Incorrect OTP code entered.';
      }
    });
  }

  Future<void> _unsubscribe() async {
    setState(() {
      isLoading = true;
    });

    final res = await BdappsService.unsubscribe(phone: phoneController.text);
    
    setState(() {
      isLoading = false;
      Provider.of<UserProvider>(context, listen: false).setPremium(false);
      statusMessage = 'Successfully unsubscribed from bdapps Premium.';
    });
  }

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);
    final isPremium = userProvider.user.isPremium;

    return Scaffold(
      appBar: AppBar(
        title: const Text('bdapps Carrier Billing', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF002B24),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF003D34),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.amber.withOpacity(0.3)),
              ),
              child: Column(
                children: [
                  const Icon(Icons.workspace_premium, color: Colors.amber, size: 48),
                  const SizedBox(height: 8),
                  const Text(
                    'PrepMate BD Premium',
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'BDT 2.00/day (+VAT/SD) billed directly to your SIM balance',
                    style: TextStyle(fontSize: 12, color: Color(0xFFA7F3D0)),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Operator Selection
            const Text('1. SELECT TELCO OPERATOR', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFA7F3D0))),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => setState(() => selectedOperator = 'Robi'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: selectedOperator == 'Robi' ? Colors.amber : const Color(0xFF003D34),
                      foregroundColor: selectedOperator == 'Robi' ? const Color(0xFF002B24) : Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text('Robi (018)'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => setState(() => selectedOperator = 'Airtel'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: selectedOperator == 'Airtel' ? Colors.amber : const Color(0xFF003D34),
                      foregroundColor: selectedOperator == 'Airtel' ? const Color(0xFF002B24) : Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text('Airtel (016)'),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Phone Field
            const Text('2. SUBSCRIBER MOBILE NUMBER', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFA7F3D0))),
            const SizedBox(height: 8),
            TextField(
              controller: phoneController,
              keyboardType: TextInputType.phone,
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFF00332B),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                hintText: '+88018XXXXXXXX',
              ),
            ),

            const SizedBox(height: 16),

            // Status message box
            if (statusMessage.isNotEmpty)
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isError ? Colors.red.withOpacity(0.2) : Colors.green.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: isError ? Colors.red : Colors.green),
                ),
                child: Text(statusMessage, style: const TextStyle(fontSize: 12, color: Colors.white)),
              ),

            // Subscription State Actions
            if (!isPremium) ...[
              if (!isOtpSent)
                ElevatedButton.icon(
                  onPressed: isLoading ? null : _requestOtp,
                  icon: const Icon(Icons.send),
                  label: Text(isLoading ? 'Connecting bdapps...' : 'Request bdapps SMS OTP (BDT 2/day)'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.amber,
                    foregroundColor: const Color(0xFF002B24),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                )
              else ...[
                if (simulationOtp != null)
                  Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: Colors.amber.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                    child: Text('Sandbox Demo OTP: \$simulationOtp', style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.bold)),
                  ),
                TextField(
                  controller: otpController,
                  keyboardType: TextInputType.number,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, letterSpacing: 8),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: const Color(0xFF00332B),
                    hintText: '----',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  onPressed: isLoading ? null : _verifyOtp,
                  icon: const Icon(Icons.verified),
                  label: const Text('Verify OTP & Activate Premium'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.amber,
                    foregroundColor: const Color(0xFF002B24),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                ),
              ],
            ] else ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.green.withOpacity(0.2), borderRadius: BorderRadius.circular(16)),
                child: const Text('✨ Active bdapps Premium Subscription', textAlign: TextAlign.center, style: TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: isLoading ? null : _unsubscribe,
                style: OutlinedButton.styleFrom(foregroundColor: Colors.redAccent),
                child: const Text('Cancel / Unsubscribe'),
              ),
            ],

            const SizedBox(height: 24),
            const Divider(color: Colors.white24),
            const SizedBox(height: 8),

            // SMS & USSD fallback buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: BdappsService.launchSmsSubscription,
                    icon: const Icon(Icons.sms, size: 16),
                    label: const Text('SMS: START PREP', style: TextStyle(fontSize: 11)),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: BdappsService.launchUssdDialer,
                    icon: const Icon(Icons.dialpad, size: 16),
                    label: const Text('USSD: *21213*999#', style: TextStyle(fontSize: 11)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
`;

export const phpBdappsHandler = `<?php
// bdapps_tap_handler.php - Production Server-side BDapps TAP API Gateway Integration
// Official Documentation: https://dev.bdapps.com/API_Documentation/bdapps_tap_api.html

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

require_once 'config.php';

$appId = getenv('BDAPPS_APP_ID') ?: "APP_012345";
$appPassword = getenv('BDAPPS_APP_PASSWORD') ?: "your_bdapps_password";
$baseUrl = getenv('BDAPPS_BASE_URL') ?: "https://api.bdapps.com";

$action = $_GET['action'] ?? '';

// 1. Webhook Notification Receiver (POST /api/bdapps/notify)
if ($action === 'notify' || $_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents("php://input");
    $data = json_decode($rawInput, true);

    if (isset($data['subscriberId']) && isset($data['status'])) {
        $subscriberId = $conn->real_escape_string($data['subscriberId']);
        $status = $conn->real_escape_string($data['status']);
        $isPremium = ($status === 'REGISTERED') ? 1 : 0;
        $cleanPhone = preg_replace('/[^0-9]/', '', $subscriberId);

        // Update database
        $sql = "INSERT INTO bdapps_subscriptions (subscriber_id, phone, status, raw_payload) 
                VALUES ('$subscriberId', '$cleanPhone', '$status', '$rawInput')
                ON DUPLICATE KEY UPDATE status = '$status', updated_at = CURRENT_TIMESTAMP";
        $conn->query($sql);

        echo json_encode([
            "statusCode" => "S1000",
            "statusDetail" => "Success"
        ]);
        exit();
    }
}

// 2. Direct Query / Health Status
echo json_encode([
    "statusCode" => "S1000",
    "statusDetail" => "bdapps PHP TAP Handler Ready",
    "version" => "1.0"
]);
?>
`;

export const phpDatabaseSql = `-- Production MySQL Database Schema for PrepMate BD & bdapps TAP API

CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`phone\` VARCHAR(20) UNIQUE NOT NULL,
  \`name\` VARCHAR(100) DEFAULT 'Student',
  \`academic_level\` ENUM('SSC', 'HSC') DEFAULT 'SSC',
  \`is_premium\` TINYINT(1) DEFAULT 0,
  \`points\` INT DEFAULT 120,
  \`streak_days\` INT DEFAULT 1,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`bdapps_subscriptions\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`subscriber_id\` VARCHAR(50) UNIQUE NOT NULL,
  \`phone\` VARCHAR(20) NOT NULL,
  \`operator\` VARCHAR(20) DEFAULT 'Robi',
  \`status\` ENUM('REGISTERED', 'UNREGISTERED', 'SUSPENDED') DEFAULT 'REGISTERED',
  \`frequency\` VARCHAR(20) DEFAULT 'DAILY',
  \`raw_payload\` TEXT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`community_posts\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`author\` VARCHAR(100) NOT NULL,
  \`level\` ENUM('SSC', 'HSC') DEFAULT 'SSC',
  \`subject\` VARCHAR(50) NOT NULL,
  \`question_text\` TEXT NOT NULL,
  \`upvotes\` INT DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`community_comments\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`post_id\` VARCHAR(50) NOT NULL,
  \`author\` VARCHAR(100) NOT NULL,
  \`comment_text\` TEXT NOT NULL,
  \`is_ai_tutor\` TINYINT(1) DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`post_id\`) REFERENCES \`community_posts\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
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
    path: 'lib/services/bdapps_service.dart',
    category: 'subscription',
    language: 'dart',
    code: flutterBdappsService,
  },
  {
    path: 'lib/screens/subscription_screen.dart',
    category: 'subscription',
    language: 'dart',
    code: flutterSubscriptionScreen,
  },
  {
    path: 'lib/services/offline_storage_service.dart',
    category: 'core',
    language: 'dart',
    code: flutterOfflineStorageService,
  },
  {
    path: 'lib/services/notification_service.dart',
    category: 'core',
    language: 'dart',
    code: flutterNotificationService,
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
    path: 'php_backend/bdapps_tap_handler.php',
    category: 'backend',
    language: 'php',
    code: phpBdappsHandler,
  },
  {
    path: 'php_backend/database.sql',
    category: 'backend',
    language: 'sql',
    code: phpDatabaseSql,
  },
];
