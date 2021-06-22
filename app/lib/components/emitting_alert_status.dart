import 'package:app/providers/alert_model.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class EmittingAlertStatus extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final alertModel = Provider.of<AlertModel>(context);

    return AnimatedOpacity(
      opacity: alertModel.alertState == AlertState.EMITTING_ALERT ? 1.0 : 0.0,
      duration: Duration(milliseconds: 150),
      child: Container(
        width: double.infinity,
        height: 50,
        color: Theme.of(context).primaryColorDark,
        alignment: Alignment.center,
        child: Text(
          'Help is on the way! People nearby have been notified.',
          style: TextStyle(color: Colors.white),
        ),
      ),
    );
  }
}
