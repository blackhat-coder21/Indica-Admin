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



// Reference to the 'gallery' collection
const galleryCollectionRef = collection(db, 'gallery');

// Function to fetch and display photos from Firestore
async function fetchPhotos() {
    try {
        const photoList = document.getElementById('photoList');
        photoList.innerHTML = ''; // Clear existing photos

        // Fetch all documents from the 'gallery' collection
        const querySnapshot = await getDocs(galleryCollectionRef);

        // Loop through each document and create HTML for displaying photos
        querySnapshot.forEach((doc) => {
            // Access the 'link' field in each document
            const photoUrl = doc.data().link;

            // Create HTML structure for each photo item
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${photoUrl}" style="max-width: 100px; max-height: 100px;"></td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deletePhoto('${doc.id}')">Delete</button>
                </td>
            `;

            // Append photo item to the table
            photoList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching photos:', error);
    }
}

// Fetch photos when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', fetchPhotos);

// Function to handle file upload to Firebase Storage
async function uploadImage(file) {
    try {
        const storageRef = ref(storage, 'images/' + file.name);
        const snapshot = await uploadBytes(storageRef, file);
        console.log('Image uploaded successfully');
        return getDownloadURL(snapshot.ref); // Return the download URL of the uploaded image
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

// Function to add a new photo
async function addPhoto(event) {
    event.preventDefault();
    const imageFile = document.getElementById('imageUpload').files[0];

    try {
        if (!imageFile) {
            alert('Please select an image to upload.');
            return;
        }

        // Upload image to Firebase Storage
        const imageUrl = await uploadImage(imageFile);

        // Add photo details to Firestore
        await addDoc(galleryCollectionRef, { link: imageUrl });
        document.getElementById('addPhotoForm').reset();
        fetchPhotos(); // Update the photo list after adding
    } catch (error) {
        console.error('Error adding photo:', error);
    }
}

// Attach event listener to the form for adding photo
document.getElementById('addPhotoForm').addEventListener('submit', addPhoto);

// Function to delete a photo
async function deletePhoto(photoId) {
    try {
        await deleteDoc(doc(db, 'gallery', photoId));
        console.log(`Photo with ID ${photoId} deleted successfully`);
        fetchPhotos(); // Update the photo list after deletion
    } catch (error) {
        console.error('Error deleting photo:', error);
    }
}