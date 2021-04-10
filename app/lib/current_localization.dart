import 'package:app/geolocalization_model.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:provider/provider.dart';
import 'package:latlong/latlong.dart';

class CurrentLocalization extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final geoModel = Provider.of<GeolocalizationModel>(context);

    if (geoModel.currentLocation == null) return Text('Loading');

    final currentLatLng = LatLng(
        geoModel.currentLocation.latitude, geoModel.currentLocation.longitude);

    return FlutterMap(
      options: MapOptions(
        center: currentLatLng,
        zoom: 13.0,
      ),
      layers: [
        TileLayerOptions(
            urlTemplate: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            subdomains: ['a', 'b', 'c']),
        MarkerLayerOptions(
          markers: [
            Marker(
              width: 80.0,
              height: 80.0,
              point: currentLatLng,
              builder: (ctx) => Container(
                child: FlutterLogo(),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
