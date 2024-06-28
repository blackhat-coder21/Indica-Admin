import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, updateDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyBOeB4Rt9-CQ7BJ24u0kLvh9BiXIauUGHI",
    authDomain: "indica-news.firebaseapp.com",
    projectId: "indica-news",
    storageBucket: "indica-news.appspot.com",
    messagingSenderId: "609269741653",
    appId: "1:609269741653:web:c8378fa0df193573f57cdc",
    measurementId: "G-P7B75FY4EX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const carouselRef = collection(db, 'carouselArticles');

// Function to upload image to Firebase Storage
function uploadImage(file) {
    const storageRef = ref(storage, 'carousel_images/' + file.name);
    return uploadBytes(storageRef, file)
        .then(snapshot => {
            console.log('Image uploaded successfully');
            return getDownloadURL(snapshot.ref);
        })
        .catch(error => {
            console.error('Error uploading image:', error);
            throw error;
        });
}

// Function to add a new carousel item
async function addCarouselItem(title, content, imageUrl) {
    try {
        await addDoc(carouselRef, {
            title: title,
            content: content,
            imageUrl: imageUrl
        });
        console.log('Carousel item added successfully');
    } catch (error) {
        console.error('Error adding carousel item:', error);
        throw error;
    }
}



// Function to fetch and display carousel items
async function fetchCarouselItems() {
    const carouselItems = document.getElementById('carouselItems');
    carouselItems.innerHTML = '';

    try {
        const querySnapshot = await getDocs(carouselRef);
        querySnapshot.forEach((doc) => {
            const item = doc.data();
            const row = `
                        <tr>
                            <td>${item.title}</td>
                            <td>${item.content}</td>
                            <td><img src="${item.imageUrl}" style="max-width: 100px; max-height: 100px;"></td>
                            <td>
                                <button type="button" class="btn btn-danger btn-sm" onclick="deleteItem('${doc.id}')">Delete</button>
                            </td>
                        </tr>
                    `;
            carouselItems.innerHTML += row;
        });
    } catch (error) {
        console.error('Error fetching carousel items:', error);
    }
}


window.deleteItem = async (id) => {
    await deleteDoc(doc(db, "carouselArticles", id));
    fetchCarouselItems();
};


// Function to handle form submission
document.getElementById('carouselForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const imageFile = document.getElementById('image').files[0];

    try {
        const imageUrl = await uploadImage(imageFile);
        await addCarouselItem(title, content, imageUrl);

        // Clear form fields after successful submission
        document.getElementById('title').value = '';
        document.getElementById('content').value = '';
        document.getElementById('image').value = '';

        // Fetch and display updated carousel items
        fetchCarouselItems();
    } catch (error) {
        console.error('Error adding carousel item:', error);
        alert('Failed to add carousel item. Please try again.');
    }
});

// Fetch and display carousel items when page loads
fetchCarouselItems();