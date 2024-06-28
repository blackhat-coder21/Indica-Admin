import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyBOeB4Rt9-CQ7BJ24u0kLvh9BiXIauUGHI",
    authDomain: "indica-news.firebaseapp.com",
    projectId: "indica-news",
    storageBucket: "indica-news.appspot.com",
    messagingSenderId: "609269741653",
    appId: "1:609269741653:web:c8378fa0df193573f57cdc",
    measurementId: "G-P7B75FY4EX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const articleForm = document.getElementById("articleForm");
const articlesDiv = document.getElementById("articles");

// Fetch and display articles
async function displayArticles() {
    articlesDiv.innerHTML = ""; // Clear previous content
    const querySnapshot = await getDocs(collection(db, "latest-article"));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const articleDiv = document.createElement("div");
        articleDiv.classList.add("col-md-4", "mb-4");
        articleDiv.innerHTML = `
            <div class="card">
                <img src="${data.imageUrl}" class="card-img-top" alt="${data.title}">
                <div class="card-body">
                    <h5 class="card-title">${data.title}</h5>
                    <p class="card-text">${data.description}</p>
                    <button class="btn btn-primary" onclick="editArticle('${doc.id}', '${data.title}', '${data.description}', '${data.imageUrl}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteArticle('${doc.id}')">Delete</button>
                </div>
            </div>
        `;
        articlesDiv.appendChild(articleDiv);
    });
}

// Add or update article
articleForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const imageFile = document.getElementById("image").files[0];
    const docId = document.getElementById("docId").value;

    let imageUrl = "";

    if (imageFile) {
        const imageRef = ref(storage, `images/${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
    }

    if (docId) {
        // Update existing article
        const articleDoc = doc(db, "latest-article", docId);
        await updateDoc(articleDoc, { title, description, imageUrl });
    } else {
        // Add new article
        await addDoc(collection(db, "latest-article"), {
            title,
            description,
            imageUrl,
        });
    }

    articleForm.reset();
    document.getElementById("docId").value = "";
    displayArticles();
});

// Edit article
window.editArticle = (id, title, description, imageUrl) => {
    document.getElementById("docId").value = id;
    document.getElementById("title").value = title;
    document.getElementById("description").value = description;
    document.getElementById("image").value = "";
};

// Delete article
window.deleteArticle = async (id) => {
    await deleteDoc(doc(db, "latest-article", id));
    displayArticles();
};

// Fetch and display articles on page load
window.onload = displayArticles;