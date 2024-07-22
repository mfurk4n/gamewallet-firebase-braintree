const functions = require('firebase-functions');
const admin = require('../config/firebaseAdmin');
const db = require('../config/firestoreDb');
const { format } = require('date-fns');

exports.getUserData = functions.region('europe-west3').https.onCall(async (data, context) => {
    const uid = context.auth ? context.auth.uid : null; 

    if (!uid) {
        return { status: 'error', msg: 'Authentication Required!' };
    }

    try {
        const userRef = db.collection('users').doc(uid); 
        const userDoc = await userRef.get(); 

        if (!userDoc.exists) {
            return { status: 'error', msg: 'User not found!' };
        }

        const userData = userDoc.data(); 

        if (userData.created_at) {
            userData.created_at = format(userData.created_at.toDate(), 'dd MMMM yyyy HH:mm:ss');
        }

        return {
            status: 'success',
            data: userData
        };
    } catch (error) {
        console.error('Error fetching user data: ', error); 
        return { status: 'error', msg: 'Internal Server Error' }; 
    }
});
