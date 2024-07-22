const braintree = require('braintree');
const functions = require('firebase-functions');
const admin = require('../config/firebaseAdmin');
const db = require('../config/firestoreDb');

const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId:  "ncwd32x77h6q9cfr",
    publicKey:  "xgjkbwsk4dwvvsvq",
    privateKey: "b1b1bd5e6e100316e10b5d9981203cdb"
});

exports.createPaymentTransaction = functions.region('europe-west3').https.onCall(async (data, context) => {
    const uid = context.auth ? context.auth.uid : null;

    if (!uid) {
        return { status: 'error', msg: 'Authentication Required!' };
    }

    try {
        const payment = await gateway.transaction.sale({
            amount: "50.00",
            paymentMethodNonce: data.paymentMethodNonce,
            options: {
                submitForSettlement: true,
            },
        });
    
        if (payment.success) {
            const userRef = db.collection('users').doc(uid);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                return { status: 'error', msg: 'User not found!' };
            }

            const user = userDoc.data();

            const batch = db.batch();

            batch.update(userRef, {
                gold: admin.firestore.FieldValue.increment(10000),
            });

            const transactionRef = db.collection('payment-transactions').doc();
            batch.set(transactionRef, {
				user_id: uid,
                tsx_id: payment.transaction.id,
                price: '50.00',
                result: 'success',
				created_at: admin.firestore.FieldValue.serverTimestamp(),
            });

            await batch.commit();

            return {
                status: 'success',
                transaction: payment.transaction,
                user: {
                    ...user,
                    gold: user.gold + 10000
                }
            };
        } else {
            return { status: 'error', msg: 'Transaction failed', details: payment.message };
        }
    } catch (error) {
        console.error('Error processing transaction: ', error);
        return { status: 'error', msg: 'Internal Server Error' };
    }
});