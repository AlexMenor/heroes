import 'package:app/alert_model.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class HeroesFab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final alertModel = Provider.of<AlertModel>(context);

    final spinner = CircularProgressIndicator(
      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
    );

    final createAlertButton = FloatingActionButton(
      onPressed: alertModel.createAlert,
      child: alertModel.loading
          ? spinner
          : new Icon(
              Icons.priority_high_rounded,
              size: 45,
              color: Colors.white,
            ),
    );

    final imSafeAlertButton = FloatingActionButton(
      onPressed: alertModel.cancelAlert,
      child: alertModel.loading
          ? spinner
          : Icon(
              Icons.verified_user,
              size: 45,
              color: Colors.white,
            ),
      backgroundColor: Colors.green,
    );

    final stopWatchingAlertButton = FloatingActionButton(
      onPressed: alertModel.stopWatchingAlert,
      child: alertModel.loading
          ? spinner
          : Icon(
              Icons.close,
              size: 45,
              color: Colors.white,
            ),
      backgroundColor: Colors.red,
    );

    return SizedBox(
        width: 80,
        height: 80,
        child: alertModel.alertState == AlertState.EMITTING_ALERT
            ? imSafeAlertButton
            : alertModel.alertState == AlertState.WATCHING_ALERT
                ? stopWatchingAlertButton
                : createAlertButton);
  }
}
