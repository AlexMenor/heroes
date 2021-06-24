import 'dart:async';
import 'dart:isolate';
import 'dart:ui';

import 'package:app/providers/alert_model.dart';
import 'package:app/components/home_status.dart';
import 'package:app/providers/geolocalization_model.dart';
import 'package:app/components/heroes_fab.dart';
import 'package:background_locator/background_locator.dart';
import 'package:background_locator/location_dto.dart';
import 'package:background_locator/settings/android_settings.dart';
import 'package:background_locator/settings/ios_settings.dart';
import 'package:background_locator/settings/locator_settings.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
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

  final AlertModel alertModel = AlertModel();

  @override
  void initState() {
    super.initState();

    this.configureFCM();

    this.configureBackgroundLocationService();
  }

  configureFCM() {
    final fcm = FirebaseMessaging();

    final onAlert = (data) {
      alertModel.registerPendingAlert(data['data']['alertId']);
      return;
    };

    final onWatchAlert = (data) {
      alertModel.watchAlert(data['data']['alertId']);
      return;
    };

    fcm.configure(
      onMessage: onAlert,
      onResume: onAlert,
      onLaunch: onWatchAlert,
    );
  }

  configureBackgroundLocationService() async {
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

    await BackgroundLocator.initialize();
    final _isRunning = await BackgroundLocator.isServiceRunning();
    geolocalizationModel.updateServiceRunning(_isRunning);

    if (!_isRunning && await _checkLocationPermission()) {
      _startLocator();
      final _isRunning = await BackgroundLocator.isServiceRunning();

      geolocalizationModel.updateServiceRunning(_isRunning);
    }
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
    BackgroundLocator.registerLocationUpdate(
      LocationCallbackHandler.callback,
      initCallback: LocationCallbackHandler.initCallback,
      disposeCallback: LocationCallbackHandler.disposeCallback,
      iosSettings:
          IOSSettings(accuracy: LocationAccuracy.NAVIGATION, distanceFilter: 0),
      autoStop: false,
      androidSettings: AndroidSettings(
        accuracy: LocationAccuracy.NAVIGATION,
        interval: 5,
        distanceFilter: 0,
        client: LocationClient.google,
        androidNotificationSettings: AndroidNotificationSettings(
          notificationChannelName: 'Location tracking',
          notificationTitle: 'Héroes Location Service',
          notificationMsg:
              'This service runs to keep the app up to date with your location',
          notificationBigMsg:
              'Background location is on to keep the app up to date with your location. This is required to know if you are close to someone that needs help.',
          notificationIcon: 'launcher_icon',
          notificationIconColor: Colors.grey,
          notificationTapCallback: LocationCallbackHandler.notificationCallback,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => this.geolocalizationModel),
        ChangeNotifierProvider(create: (_) => this.alertModel),
      ],
      child: MaterialApp(
        title: 'Héroes',
        theme: ThemeData(
          primarySwatch: Colors.indigo,
          visualDensity: VisualDensity.adaptivePlatformDensity,
          accentColor: Colors.orangeAccent,
        ),
        home: Scaffold(
          appBar: AppBar(
            title: Row(
              children: [
                Image.asset('assets/logo.png', height: 45.0),
              ],
              mainAxisAlignment: MainAxisAlignment.start,
            ),
          ),
          body: HomeStatus(),
          floatingActionButton: HeroesFab(),
        ),
      ),
    );
  }
}
