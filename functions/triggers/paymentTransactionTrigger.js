const functions = require('firebase-functions');

exports.onPaymentTransactionCreated = functions.region('europe-west3').firestore
    .document('payment-transactions/{transactionId}')
    .onCreate((snap, context) => {
        const newValue = snap.data(); 
        const transactionId = context.params.transactionId; 

        console.log(`New transaction created with ID: ${transactionId}`);
        console.log('Transaction details:', newValue);

        return null;
    });



