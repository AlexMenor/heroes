import 'package:app/providers/alert_model.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class WatchingAlertStatus extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final alertModel = Provider.of<AlertModel>(context);

    return AnimatedOpacity(
      opacity: alertModel.alertState == AlertState.WATCHING_ALERT ? 1.0 : 0.0,
      duration: Duration(milliseconds: 150),
      child: Container(
        width: double.infinity,
        height: 50,
        color: Theme.of(context).primaryColor,
        alignment: Alignment.center,
        child: Text(
          'You can now see the real time location in the map',
          style: TextStyle(color: Colors.white),
        ),
      ),
    );
  }
}
