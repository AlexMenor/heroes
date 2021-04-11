import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:firebase_messaging/firebase_messaging.dart';

class AlertModel extends ChangeNotifier {
  String _activeAlertId;
  bool loading = false;

  bool get thereIsAnAlertActive {
    return _activeAlertId != null;
  }

  void createAlert() async {
    final userId = await FirebaseMessaging().getToken();

    _toggleLoading();

    final response = await http.post(Uri.https(env['ENDPOINT'], '/alert'),
        body: jsonEncode(<String, String>{
          'userId': userId,
        }),
        headers: {'Content-Type': 'application/json'});

    _toggleLoading();

    print('Response of create alert call: ${response.statusCode}');

    if (response.statusCode == 201) {
      _activeAlertId = jsonDecode(response.body)['_id'];
      notifyListeners();
    }
  }

  void cancelAlert() async {
    if (_activeAlertId != null) {
      _toggleLoading();

      final response = await http
          .delete(Uri.https(env['ENDPOINT'], '/alert/$_activeAlertId'));

      _toggleLoading();

      print('Response of cancel alert call: ${response.statusCode}');

      if (response.statusCode == 200) {
        _activeAlertId = null;
        notifyListeners();
      }
    }
  }

  void _toggleLoading() {
    loading = !loading;
    notifyListeners();
  }
}
