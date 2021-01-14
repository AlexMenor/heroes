import 'package:flutter/material.dart';
import 'package:latlng/latlng.dart';
import 'package:map/map.dart';
import 'package:cached_network_image/cached_network_image.dart';


class MyMap extends StatefulWidget {
  final LatLng location;
  MyMap({Key key, this.location}) : super(key: key);
  @override
  _MyMapState createState() => _MyMapState(this.location);
}

class _MyMapState extends State<MyMap> {
  _MyMapState(LatLng location){
    this.controller = MapController(location: location);
  }
  MapController controller;

  void _onDoubleTap() {
    controller.zoom += 0.5;
  }

  Offset _dragStart;
  double _scaleStart = 1.0;
  void _onScaleStart(ScaleStartDetails details) {
    _dragStart = details.focalPoint;
    _scaleStart = 1.0;
  }

  void _onScaleUpdate(ScaleUpdateDetails details) {
    final scaleDiff = details.scale - _scaleStart;
    _scaleStart = details.scale;

    if (scaleDiff > 0) {
      controller.zoom += 0.02;
    } else if (scaleDiff < 0) {
      controller.zoom -= 0.02;
    } else {
      final now = details.focalPoint;
      final diff = now - _dragStart;
      _dragStart = now;
      controller.drag(diff.dx, diff.dy);
    }
  }
  @override
  Widget build(BuildContext context) {
    return Container(
      child: GestureDetector(
        onDoubleTap: _onDoubleTap,
        onScaleStart: _onScaleStart,
        onScaleUpdate: _onScaleUpdate,
        child: Stack(
          children: [
            Map(
              controller: controller,
              builder: (context, x, y, z) {
                final url =
                    'https://tile.openstreetmap.org/$z/$x/$y.png';

                return CachedNetworkImage(
                  imageUrl: url,
                  fit: BoxFit.cover,
                );

              },
            ),
          ],
        ),
      ),

    );
  }
}