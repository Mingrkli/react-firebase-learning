// Recommend making some of theses codes into different components in the future when creating your projects because this is just for learning purposes

import "./App.css";
import { useEffect, useState } from "react";
import { v4 } from "uuid";

import { auth, db, storage } from "./config/firebase-config";
import {
    getDocs,
    collection,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
} from "firebase/firestore";
import { Auth } from "./components/auth";
import {
    deleteObject,
    getDownloadURL,
    listAll,
    ref,
    uploadBytes,
} from "firebase/storage";

function App() {
    const [movieList, setMovieList] = useState([]);

    // New Movie States
    const [newMovieTitle, setNewMovieTitle] = useState("");
    const [newReleaseDate, setNewReleaseDate] = useState(0);
    const [isNewMovieOscar, setIsNewMovieOscar] = useState(false);

    // Update Title State
    // Note: because were doing everything in this file for this learning tutorial, this updatedTitle is kind of bugged. If we put a title in a input then press the update title button on another movie, it will change that movie instead which is kind of a bug but, this would not happen if you create the codes into there own components instead
    const [updatedTitle, setUpdatedTitle] = useState("");

    // File Upload State
    const [fileUpload, setFileUpload] = useState(null);
    const [imageList, setImageList] = useState([]);

    const moviesCollectionRef = collection(db, "movies");
    const imageListRef = ref(storage, `projectsFiles/`);

    const getMovieList = async () => {
        // READ THE DATA

        // SET THE MOVIE LIST
        try {
            const data = await getDocs(moviesCollectionRef);

            const filteredData = data.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));

            setMovieList(filteredData);
        } catch (error) {
            console.error(error);
        }
    };

    const deleteMovie = async (id) => {
        try {
            const movieDoc = doc(db, "movies", id);
            await deleteDoc(movieDoc);

            getMovieList();
        } catch (error) {
            console.error(error);
        }
    };

    const updateMovieTitle = async (id) => {
        try {
            const movieDoc = doc(db, "movies", id);
            await updateDoc(movieDoc, { title: updatedTitle });

            getMovieList();
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        listAll(imageListRef).then((response) => {
            response.items.forEach((item) => {
                getDownloadURL(item).then((url) => {
                    setImageList((currentImageList) => [
                        ...currentImageList,
                        url,
                    ]);
                });
            });
        });

        getMovieList();
    }, []);

    const onSubmitMovie = async () => {
        try {
            await addDoc(moviesCollectionRef, {
                title: newMovieTitle,
                releaseDate: newReleaseDate,
                receivedAnOscar: isNewMovieOscar,
                userId: auth?.currentUser?.uid,
            });

            getMovieList();
        } catch (error) {
            console.error(error);
        }
    };

    const uploadFile = async () => {
        if (!fileUpload) return;

        try {
            const filesFolderRef = ref(
                storage,
                `projectsFiles/${fileUpload.name + v4()}`
            );

            const snapshot = await uploadBytes(filesFolderRef, fileUpload);
            console.log(snapshot);
            getDownloadURL(snapshot.ref).then((url) => {
                setImageList((currentImageList) => [...currentImageList, url]);
            });
        } catch (error) {
            console.error(error);
        }
    };

    const deleteImg = async (url) => {
        const imgRef = ref(storage, url);

        // Delete the file
        deleteObject(imgRef);
    };

    return (
        <div className="App">
            <Auth />

            <div>
                <input
                    placeholder="Movie title..."
                    onChange={(e) => setNewMovieTitle(e.target.value)}
                />
                <input
                    placeholder="Release Date..."
                    type="number"
                    // Pretty sure the number comes out as a string so we use Number()
                    onChange={(e) => setNewReleaseDate(Number(e.target.value))}
                />
                <input
                    type="checkbox"
                    checked={isNewMovieOscar}
                    onChange={(e) => setIsNewMovieOscar(e.target.checked)}
                />
                <label>Received an Oscar</label>
                <button onClick={onSubmitMovie}>Submit Movie</button>
            </div>

            <div className="movieList">
                {movieList.map((movie) => (
                    <div>
                        <h1
                            style={{
                                color: movie.receivedAnOscar ? "green" : "red",
                            }}
                        >
                            {movie.title}
                        </h1>

                        <p>Date: {movie.releaseDate}</p>

                        <div>
                            <button onClick={() => deleteMovie(movie.id)}>
                                Delete Movie
                            </button>

                            <input
                                placeholder="New Title..."
                                onChange={(e) =>
                                    setUpdatedTitle(e.target.value)
                                }
                            />
                            <button onClick={() => updateMovieTitle(movie.id)}>
                                Update Title
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="imageList">
                {imageList.map((url) => {
                    return (
                        <div>
                            <img src={url} />
                            <button onClick={() => deleteImg(url)}>
                                Delete Image
                            </button>
                        </div>
                    );
                })}
            </div>

            <div>
                <input
                    type="file"
                    onChange={(e) => setFileUpload(e.target.files[0])}
                />
                <button onClick={uploadFile}>Upload File</button>
            </div>
        </div>
    );
}

export default App;
