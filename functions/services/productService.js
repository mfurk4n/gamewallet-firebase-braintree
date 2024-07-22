const functions = require('firebase-functions');
const admin = require('../config/firebaseAdmin');
const db = require('../config/firestoreDb');

exports.addProduct = functions.region('europe-west3').https.onCall(async (data, context) => {
    const uid = context.auth ? context.auth.uid : null; 

    if (!uid) {
        return { status: 'error', msg: 'Authentication Required!' };
    }

    const { name, price} = data; 
    if (!name || !price) {
        return { status: 'error', msg: 'Missing product information!' };
    }

    if (typeof price !== 'number' || !Number.isInteger(price)) {
        return { status: 'error', msg: 'Price must be a numeric and an integer!' };
    }

    try {

        const existingProductSnapshot = await db.collection('products')
            .where('name', '==', name)
            .get();

        if (!existingProductSnapshot.empty) {
            return { status: 'error', msg: 'Product with this name already exists!' };
        }

        const productData = {
            name,
            price,
            sold_count : 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: uid
        };
    
        const productRef = await db.collection('products').add(productData);

        return {
            status: 'success',
            msg: 'Product added successfully!',
            productId: productRef.id
        };
    } catch (error) {
        console.error('Error adding product: ', error); 
        return { status: 'error', msg: 'Internal Server Error' }; 
    }
});


exports.getAllProducts = functions.region('europe-west3').https.onCall(async (data, context) => {
    try {
        const productsSnapshot = await db.collection('products').get();
        const products = [];

        productsSnapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });

        return {
            status: 'success',
            data: products
        };
    } catch (error) {
        console.error('Error fetching products: ', error);
        return { status: 'error', msg: 'Internal Server Error' };
    }
});

