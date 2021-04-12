import 'package:app/alert_model.dart';
import 'package:app/emitting_alert_status.dart';
import 'package:app/geolocalization_model.dart';
import 'package:app/watching_alert_status.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:provider/provider.dart';
import 'package:latlong/latlong.dart';

class HomeStatus extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final geoModel = Provider.of<GeolocalizationModel>(context);

    final alertModel = Provider.of<AlertModel>(context);

    final List<Marker> markers = [];

    var defaultMapLocation = LatLng(0, 0);

    if (geoModel.currentLocation != null) {
      final currentLatLng = LatLng(geoModel.currentLocation.latitude,
          geoModel.currentLocation.longitude);
      markers.add(Marker(
        width: 20.0,
        height: 20.0,
        point: currentLatLng,
        builder: (ctx) => Container(
          child: Image.asset(
            'assets/current_position_marker.png',
          ),
        ),
      ));

      defaultMapLocation = currentLatLng;
    } else {
      return Text("Loading");
    }

    if (alertModel.helpeeLocation != null) {
      final currentHelpeeLocation = LatLng(alertModel.helpeeLocation.latitude,
          alertModel.helpeeLocation.longitude);

      markers.add(Marker(
        width: 20.0,
        height: 20.0,
        point: currentHelpeeLocation,
        builder: (ctx) => Container(
          child: Image.asset(
            'assets/helpee_position_marker.png',
          ),
        ),
      ));
    }

    final pendingAlertId = alertModel.pendingAlertId;

    if (pendingAlertId != null) {
      alertModel.registerPendingAlert(null);

      final acceptAlertSnackbar = SnackBar(
        content: Text(
          'Someone nearby needs help',
          style: TextStyle(color: Colors.black),
        ),
        action: SnackBarAction(
          label: 'Accept',
          textColor: Colors.black,
          onPressed: () {
            alertModel.watchAlert(pendingAlertId);
          },
        ),
        duration: Duration(minutes: 1),
        backgroundColor: Theme.of(context).accentColor,
      );

      WidgetsBinding.instance.addPostFrameCallback((_) {
        ScaffoldMessenger.of(context).showSnackBar(acceptAlertSnackbar);
      });
    }

    return Stack(
      children: [
        FlutterMap(
          options: MapOptions(center: defaultMapLocation, zoom: 17.0),
          layers: [
            TileLayerOptions(
              urlTemplate: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
              subdomains: ['a', 'b', 'c'],
            ),
            MarkerLayerOptions(
              markers: markers,
            ),
          ],
        ),
        Stack(
          children: [WatchingAlertStatus(), EmittingAlertStatus()],
        ),
      ],
    );
  }
}
