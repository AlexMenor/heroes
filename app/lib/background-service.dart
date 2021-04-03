import 'dart:convert';

import 'package:background_location/background_location.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

Future init() async {
  BackgroundLocation.getPermissions(
    onGranted: () async {
      print("granted!!");
      await BackgroundLocation.setAndroidConfiguration(1000);
      BackgroundLocation.startLocationService();
      BackgroundLocation.getLocationUpdates((location) {
        postLocation(location);
      });
    },
    onDenied: () {
      print("denied");
    },
  );
}

destroy() {
  BackgroundLocation.stopLocationService();
}

Future postLocation(Location location) async {
  final fbm = FirebaseMessaging();
  final userId = await fbm.getToken();
  
  final response = await http.post(Uri.https(env['ENDPOINT'], '/location/$userId'),
      body: jsonEncode(<String, String>{
        'latLong': '${location.latitude},${location.longitude}',
      }),
      headers: {'Content-Type': 'application/json'});

  print("Response of post location service: ${response.statusCode}");
}
