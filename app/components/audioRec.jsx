'use client';

import React, { useState, useRef } from 'react';
import { storage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';


const mimeType = "audio/webm";

const AudioRec = () => {

    const [permission, setPermission] = useState(false);
    const mediaRecorder = useRef(null);
    const [stream, setStream] = useState(null);
    const [recordingStatus, setRecordingStatus] = useState("inactive");
    const [audioChunks, setAudioChunks] = useState([]);
    const [audio, setAudio] = useState(null);

    const [emotion, setEmotion] = useState(null);

    const getMicrophonePermission = async () => {
        if ("MediaRecorder" in window) {
            try {
                const streamData = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false,
                });
                setPermission(true);
                setStream(streamData);
            } catch (err) {
                alert(err.message);
            }
        } else {
            alert("The MediaRecorder API is not supported in your browser.");
        }
    };

    const startRecording = async () => {
        setRecordingStatus("recording");
        const media = new MediaRecorder(stream, { type: mimeType });
        mediaRecorder.current = media;
        mediaRecorder.current.start();
        let localAudioChunks = [];
        mediaRecorder.current.ondataavailable = (event) => {
           if (typeof event.data === "undefined") return;
           if (event.data.size === 0) return;
           localAudioChunks.push(event.data);
        };
        setAudioChunks(localAudioChunks);
    };

    const stopRecording = () => {
        setRecordingStatus("inactive");
        mediaRecorder.current.stop();
        mediaRecorder.current.onstop = () => {
           const audioBlob = new Blob(audioChunks, { type: mimeType });
           const audioUrl = URL.createObjectURL(audioBlob);

            // Blob Upload to firebase
            const timestamp = new Date().toISOString();
            const storageRef = ref(storage, `audio_files/${timestamp}.mp4`);
            uploadBytes(storageRef, audioBlob).then((snapshot) => {
                console.log('Uploaded a blob.')
                getDownloadURL(snapshot.ref).then(async (downloadURL) => {
                    // Send download url to backend
                    const response = await fetch('https://capstone-project-server-zigr.onrender.com/predict/', {
                        method: 'POST',
                        body: JSON.stringify({
                            "URL": downloadURL
                        })
                    });
                    const data = await response.json();
                    setEmotion(data);
                });
            }).catch((error) => {
                console.log(error.message);
            });

           setAudio(audioUrl);
           setAudioChunks([]);
        };
    };

    return (
        <div className='h-screen p-8'>
        <div className='shadow-lg shadow-black h-full text-center transition duration:500 bg-gray-300 hover:bg-gray-400 border-black border-none rounded-2xl'>
            <h2 className='text-4xl font-bold pt-32'>Infant Cry Classification</h2>
            <main>
                <div className="audio-controls pt-8">
                    {!permission ? (
                        <button onClick={getMicrophonePermission} type="button">
                            <div className='px-4 border-black rounded-3xl border-4 p-2 bg-grey-400 transition duration:500 hover:bg-black hover:text-white'>Give Microphone Permission</div>
                        </button>
                    ) : null}
                    {permission && recordingStatus === "inactive" ? (
                        <button onClick={startRecording} type="button">
                            <div className='px-4 border-black rounded-3xl border-4 p-2 bg-grey-400 transition duration:500 hover:bg-black hover:text-white'>Start Recording <MicIcon/></div>
                        </button>
                    ) : null}
                    {recordingStatus === "recording" ? (
                        <button onClick={stopRecording} type="button">
                            <div className='px-4 border-black rounded-3xl border-4 p-2 bg-grey-400 transition duration:500 hover:bg-black hover:text-white'>Stop Recording <MicOffIcon/></div>
                        </button>
                    ) : null}
                </div>
                <div className='my-10'>
                    {recordingStatus === "recording" && (<p>Recording Audio</p>)}
                </div>
                {audio ? (
                    <div className="audio-container">
                        <div className='flex w-full justify-center pb-8'><audio src={audio} controls></audio></div>
                        <a download href={audio}>
                            Download Recording
                        </a>
                    </div>
                ) : null}
                <div className='my-10 px-40'>
                    <h1 className='font-bold'>Emotion</h1>
                    <h1 className='pb-4'>{emotion && (<p>{emotion.response}</p>)}</h1>
                    <h1 className='font-bold'>Suggestion</h1>
                    <h1>{emotion && (<p>{emotion.output}</p>)}</h1>
                </div>
            </main>
        </div>
        </div>
    );
};

export default AudioRec;