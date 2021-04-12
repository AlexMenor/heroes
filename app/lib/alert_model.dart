import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:web_socket_channel/io.dart';

import 'geolocalization_model.dart';

enum AlertState { NONE, WATCHING_ALERT, EMITTING_ALERT }

class AlertModel extends ChangeNotifier {
  String _activeAlertId;
  String pendingAlertId;
  bool loading = false;
  HeroLocation helpeeLocation;

  IOWebSocketChannel _listenAlertChannel;

  AlertState get alertState {
    if (_activeAlertId == null)
      return AlertState.NONE;
    else if (helpeeLocation != null)
      return AlertState.WATCHING_ALERT;
    else
      return AlertState.EMITTING_ALERT;
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

  void watchAlert(String alertId) {
    _listenAlertChannel =
        IOWebSocketChannel.connect('wss://${env['ENDPOINT']}/alert/$alertId');
    _listenAlertChannel.stream.listen((event) {
      _activeAlertId = alertId;
      helpeeLocation = _parseRawLocation(event);
      notifyListeners();
    }, onDone: () {
      helpeeLocation = null;
      _activeAlertId = null;
      notifyListeners();
    }, onError: (err) {
      print("Error listening alert websocket");
      print(err);
    });
  }

  void stopWatchingAlert() {
    _listenAlertChannel.sink.close();
    _listenAlertChannel = null;
    notifyListeners();
  }

  void registerPendingAlert(String alertId) {
    pendingAlertId = alertId;
    notifyListeners();
  }

  HeroLocation _parseRawLocation(String raw) {
    final json = jsonDecode(raw);
    final List<dynamic> coordinates = json['loc']['coordinates'];
    return HeroLocation(latitude: coordinates[1], longitude: coordinates[0]);
  }

  void _toggleLoading() {
    loading = !loading;
    notifyListeners();
  }
}
