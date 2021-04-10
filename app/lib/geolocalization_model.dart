import 'package:flutter/foundation.dart';

class GeolocalizationModel extends ChangeNotifier {
  bool serviceRunning;
  HeroLocation currentLocation;

  void updateLocation(HeroLocation newLocation) {
    this.currentLocation = newLocation;
    notifyListeners();
  }

  void updateServiceRunning(bool newServiceRunning) {
    this.serviceRunning = newServiceRunning;
    notifyListeners();
  }
}

class HeroLocation {
  final double latitude;
  final double longitude;

  HeroLocation({this.latitude, this.longitude});

  @override
  String toString() {
    return '$latitude,$longitude';
  }
}
