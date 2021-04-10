import 'dart:async';
import 'dart:isolate';
import 'dart:ui';

import 'package:app/current_localization.dart';
import 'package:app/geolocalization_model.dart';
import 'package:background_locator/background_locator.dart';
import 'package:background_locator/location_dto.dart';
import 'package:background_locator/settings/android_settings.dart';
import 'package:background_locator/settings/ios_settings.dart';
import 'package:background_locator/settings/locator_settings.dart';
import 'package:flutter/material.dart';
import 'package:location_permissions/location_permissions.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart' as DotEnv;
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';

import 'location_callback_handler.dart';

Future main() async {
  await DotEnv.load();
  await Firebase.initializeApp();

  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  ReceivePort port = ReceivePort();

  final GeolocalizationModel geolocalizationModel = GeolocalizationModel();

  @override
  void initState() {
    super.initState();

    if (IsolateNameServer.lookupPortByName(
            LocationCallbackHandler.isolateName) !=
        null) {
      IsolateNameServer.removePortNameMapping(
          LocationCallbackHandler.isolateName);
    }

    IsolateNameServer.registerPortWithName(
        port.sendPort, LocationCallbackHandler.isolateName);

    port.listen(
      (dynamic data) async {
        final locationDto = data as LocationDto;
        geolocalizationModel.updateLocation(HeroLocation(
            latitude: locationDto.latitude, longitude: locationDto.longitude));
      },
    );
    initPlatformState();
  }

  Future<void> initPlatformState() async {
    await BackgroundLocator.initialize();
    final _isRunning = await BackgroundLocator.isServiceRunning();
    geolocalizationModel.updateServiceRunning(_isRunning);

    if (!_isRunning && await _checkLocationPermission()) {
      _startLocator();
      final _isRunning = await BackgroundLocator.isServiceRunning();

      geolocalizationModel.updateServiceRunning(_isRunning);
    } else {
      // Handle
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        title: 'Héroes',
        theme: ThemeData(
          primarySwatch: Colors.blue,
          visualDensity: VisualDensity.adaptivePlatformDensity,
        ),
        home: Scaffold(
            appBar: AppBar(
              title: const Text('Héroes'),
            ),
            body: ChangeNotifierProvider(
                create: (_) => this.geolocalizationModel,
                child: CurrentLocalization())));
  }

  Future<bool> _checkLocationPermission() async {
    final access = await LocationPermissions().checkPermissionStatus();
    switch (access) {
      case PermissionStatus.unknown:
      case PermissionStatus.denied:
      case PermissionStatus.restricted:
        final permission = await LocationPermissions().requestPermissions(
          permissionLevel: LocationPermissionLevel.locationAlways,
        );
        if (permission == PermissionStatus.granted) {
          return true;
        } else {
          return false;
        }
        break;
      case PermissionStatus.granted:
        return true;
        break;
      default:
        return false;
        break;
    }
  }

  void _startLocator() {
    BackgroundLocator.registerLocationUpdate(LocationCallbackHandler.callback,
        initCallback: LocationCallbackHandler.initCallback,
        disposeCallback: LocationCallbackHandler.disposeCallback,
        iosSettings: IOSSettings(
            accuracy: LocationAccuracy.NAVIGATION, distanceFilter: 0),
        autoStop: false,
        androidSettings: AndroidSettings(
            accuracy: LocationAccuracy.NAVIGATION,
            interval: 5,
            distanceFilter: 0,
            client: LocationClient.google,
            androidNotificationSettings: AndroidNotificationSettings(
                notificationChannelName: 'Location tracking',
                notificationTitle: 'Start Location Tracking',
                notificationMsg: 'Track location in background',
                notificationBigMsg:
                    'Background location is on to keep the app up-tp-date with your location. This is required for main features to work properly when the app is not running.',
                notificationIcon: '',
                notificationIconColor: Colors.grey,
                notificationTapCallback:
                    LocationCallbackHandler.notificationCallback)));
  }
}
