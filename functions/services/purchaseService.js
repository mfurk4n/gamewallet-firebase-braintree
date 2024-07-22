const functions = require('firebase-functions');
const admin = require('../config/firebaseAdmin');
const db = require('../config/firestoreDb');
 
exports.buyItem = functions.region('europe-west3').https.onCall(async (data, context) => {
    const uid = context.auth ? context.auth.uid : null; 
    const productDocId = data.product_id; 

    if (!uid) {
        return { status: 'error', msg: 'Authentication Required!' };
    }

    try {
        const userRef = db.collection('users').doc(uid); 
        const productRef = db.collection('products').doc(productDocId); 

        const productDoc = await productRef.get();

        if (!productDoc.exists) {
            return { status: 'error', msg: 'Item not found!' };
        }

        const product = productDoc.data();

        const userDoc = await userRef.get(); 

        if (!userDoc.exists) {
            return { status: 'error', msg: 'User not found!' };
        }

        const user = userDoc.data(); 

        if (user.gold < product.price) {
            return { status: 'error', msg: 'Insufficient gold!' };
        }

        const batch = db.batch(); 

        batch.update(userRef, {
            gold: admin.firestore.FieldValue.increment(-product.price)
        });

        const purchaseRef = userRef.collection('purchased_products').doc(); 
        
        batch.set(purchaseRef, {
            product_id: productDoc.id,
            name: product.name,
            user_id: uid,
            isUsed: false,
            created_at: admin.firestore.FieldValue.serverTimestamp()
        });

        const transactionRef = userRef.collection('purchase_transactions').doc();
       
        batch.set(transactionRef, {
            user_id: uid,
            product_id: productDoc.id,
            product_name: product.name,
            price: product.price,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
        });

        batch.update(productDoc.ref, {
            sold_count: admin.firestore.FieldValue.increment(1)
        });

        await batch.commit();

        return {
            status: 'success',
            sold_count: product.sold_count + 1
        };
    } catch (error) {
        console.error('Error processing purchase: ', error); 
        return { status: 'error', msg: 'Internal Server Error' }; 
    }
});


