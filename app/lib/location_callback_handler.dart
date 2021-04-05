import 'dart:async';
import 'dart:isolate';
import 'dart:ui';
import 'dart:convert';


import 'package:http/http.dart' as http;

import 'package:background_locator/location_dto.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart' as DotEnv;


class LocationCallbackHandler {
  static const String isolateName = 'LocatorIsolate';

  static Future<void> initCallback(Map<dynamic, dynamic> params) async {
    print("Location Callback Handler INIT");
  }

  static Future<void> disposeCallback() async {
    print("Location Callback Handler DISPOSE");
  }

  static Future<void> callback(LocationDto locationDto) async {
    print('Location callback updated: ${locationDto.toString()}');
    final SendPort send = IsolateNameServer.lookupPortByName(isolateName);
    send?.send(locationDto);
    _postLocation(locationDto);
  }

  static Future<void> notificationCallback() async {
    print('Notification clicked');
  }

  static Future _postLocation(LocationDto location) async {

    final userId = "Static";
    await DotEnv.load();

    final response = await http.put(Uri.https(DotEnv.env['ENDPOINT'], '/location/$userId'),
        body: jsonEncode(<String, String>{
          'latLong': '${location.latitude},${location.longitude}',
        }),
        headers: {'Content-Type': 'application/json'});

    print("Response of post location service: ${response.statusCode}");
  }
}
