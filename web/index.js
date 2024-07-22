import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-functions.js";

const firebaseConfig = {
    apiKey: "AIzaSyCRes72R-qiCp4-tJS3zPUTTtuZUvqWfRQ",
    authDomain: "midas-case-e76e7.firebaseapp.com",
    projectId: "midas-case-e76e7",
    storageBucket: "midas-case-e76e7.appspot.com",
    messagingSenderId: "102719452522",
    appId: "1:102719452522:web:f9c7c0da0bc6b7aad9e113"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const functions = getFunctions(app,'europe-west3');

document.addEventListener('DOMContentLoaded', (event) => {
    const googleButton = document.getElementById('googleButton');
    const paymentButton = document.getElementById('paymentButton');
    const userDataButton = document.getElementById('userDataButton');
    const productName = document.getElementById('productName');
    const productPrice = document.getElementById('productPrice');
    const addProductButton = document.getElementById('addProductButton');
    const fetchProductsButton = document.getElementById('fetchProductsButton');
    const loader = document.getElementById('loader');
    const productsContainer = document.getElementById('productsContainer');
    const submitPaymentButton = document.getElementById('submitPaymentButton');
    let dropinInstance;

    function showLoader() {
        loader.style.display = 'block';
    }

    function hideLoader() {
        loader.style.display = 'none';
    }

    googleButton.addEventListener('click', () => {
        signInWithPopup(auth, googleProvider)
        .then((result) => {
            const user = result.user;
            const messageContainer = document.createElement('p');
            messageContainer.textContent = 'Signed in as: ' + user.email;
            document.body.appendChild(messageContainer);

            googleButton.style.display = 'none';
            paymentButton.style.display = 'block';
            userDataButton.style.display = 'block';
            productName.style.display = 'block';
            productPrice.style.display = 'block';
            addProductButton.style.display = 'block';
            fetchProductsButton.style.display = 'block';
            

            paymentButton.addEventListener('click', async () => {
                try {
                    showLoader();
                    if (dropinInstance) {
                        await dropinInstance.teardown(() => {
                            console.log('Drop-in instance cleared.');
                        });
                    }
                    dropinInstance = await braintree.dropin.create({
                        authorization: "sandbox_cszgfxwn_ncwd32x77h6q9cfr",
                        container: '#dropin-container'
                    });
                    const paymentSection = document.getElementById('dropin-container');
                    paymentSection.style.display = 'block';
                    submitPaymentButton.style.display = 'block';
                } catch (error) {
                    console.log("Error: ", error);
                } finally {
                    hideLoader();
                }
            });

            submitPaymentButton.addEventListener('click', async () => {
                if (!dropinInstance) return;
                try {
                    dropinInstance.requestPaymentMethod(async (err, payload) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        try {
                            showLoader();
                            const createPaymentTransaction = httpsCallable(functions, 'createPaymentTransaction');
                            const paymentResult = await createPaymentTransaction({ paymentMethodNonce: payload.nonce });
                            const messageContainer = document.createElement('p');
                            hideLoader();
                            if (paymentResult.data.status === 'success') {
                                messageContainer.textContent = 'Payment successful! New Gold: ' + paymentResult.data.user.gold;
                                
                                const paymentSection = document.getElementById('dropin-container');
                                paymentSection.style.display = 'none';
                                submitPaymentButton.style.display = 'none';
                            } else {
                                messageContainer.textContent = 'Error: ' + paymentResult.data.msg + 'Details: ' + paymentResult.data.details;
                            }
                            document.body.appendChild(messageContainer);
                        } catch (serverError) {
                            console.log("Server error: ", serverError);
                        }
                    });
                } catch (error) {
                    console.log("Error: ", error);
                }
            });


            userDataButton.addEventListener('click', async () => {
                try {
                    showLoader();
                    const getUserData = httpsCallable(functions, 'getUserData');
                    const result = await getUserData();
                    const messageContainer = document.createElement('p');
                    if (result.data.status === 'success') {
                        messageContainer.textContent = 'User Data: ' + JSON.stringify(result.data.data);
                    } else {
                        messageContainer.textContent = 'Error: ' + result.data.msg;
                    }
                    document.body.appendChild(messageContainer);
                } catch (error) {
                    console.log("Error: ", error);
                } finally {
                    hideLoader();
                }
            });

            addProductButton.addEventListener('click', async () => {
              const productNameValue = productName.value;
              const productPriceValue = parseInt(productPrice.value);
              try {
                  showLoader();
                  const addProduct = httpsCallable(functions, 'addProduct');
                  const result = await addProduct({ name: productNameValue, price: productPriceValue });
                  const messageContainer = document.createElement('p');
                  if (result.data.status === 'success') {
                      messageContainer.textContent = 'Response: ' + result.data.msg + " productId: " + result.data.productId;
                  } else {
                      messageContainer.textContent = 'Error: ' + result.data.msg;
                  }
                  document.body.appendChild(messageContainer);
              } catch (error) {
                  console.log("Error: ", error);
              } finally {
                  hideLoader();
              }
            });

            fetchProductsButton.addEventListener('click', async () => {
                try {
                    showLoader();
                    const getAllProducts = httpsCallable(functions, 'getAllProducts');
                    const result = await getAllProducts();
                    if (result.data.status === 'success') {
                        productsContainer.innerHTML = '';
                        result.data.data.forEach(product => {
                            const productBox = document.createElement('div');
                            productBox.className = 'product-box';
                            productBox.textContent = `name: ${product.name}, price: ${product.price}`;
                            productBox.addEventListener('click', async () => {
                                try {
                                    showLoader();
                                    const buyItem = httpsCallable(functions, 'buyItem');
                                    const buyResult = await buyItem({ product_id: product.id });
                                    const messageContainer = document.createElement('p');
                                    if (buyResult.data.status === 'success') {
                                        messageContainer.textContent = 'Purchase successful! Product Sold Count: ' + buyResult.data.sold_count;
                                    } else {
                                        messageContainer.textContent = 'Error: ' + buyResult.data.msg;
                                    }
                                    document.body.appendChild(messageContainer);
                                } catch (error) {
                                    console.log("Error: ", error);
                                } finally {
                                    hideLoader();
                                }
                            });
                            productsContainer.appendChild(productBox);
                        });
                    } else {
                        const messageContainer = document.createElement('p');
                        messageContainer.textContent = 'Error: ' + result.data.msg;
                        document.body.appendChild(messageContainer);
                    }
                } catch (error) {
                    console.log("Error: ", error);
                } finally {
                    hideLoader();
                }
            });

        }).catch((error) => {
            console.log("Error: ", error);
        });
    });
});
