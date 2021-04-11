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
          : new Icon(Icons.priority_high_rounded, size: 45),
    );

    final cancelAlertButton = FloatingActionButton(
      onPressed: alertModel.cancelAlert,
      child: alertModel.loading ? spinner : Icon(Icons.verified_user, size: 45),
      backgroundColor: Colors.green,
    );

    return SizedBox(
        width: 80,
        height: 80,
        child: alertModel.thereIsAnAlertActive
            ? cancelAlertButton
            : createAlertButton);
  }
}
