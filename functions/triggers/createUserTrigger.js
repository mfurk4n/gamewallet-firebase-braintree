const functions = require('firebase-functions');
const admin = require('../config/firebaseAdmin');

exports.createUser = functions.region('europe-west3').auth.user().onCreate((user) => {
	return admin.firestore().collection('users').doc(user.uid).set(
		{
                  uid: user.uid,
                  name: user.displayName,
                  email: user.email,
                  gold: 1000,
                  created_at: admin.firestore.FieldValue.serverTimestamp()
		}
	);
});

