/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useRef, useEffect } from "react";
import "./style.css";
import { useToast } from "../../lib/hooks/useToast";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import coreURL from "@ffmpeg/core?url";
import wasmURL from "@ffmpeg/core/wasm?url";
import { sanitizeName } from "../../lib/utils/sanitizeName";

const ffmpeg = new FFmpeg();

const AudioUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { addToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadFFmpeg = useCallback(async () => {
    try {
      if (!ffmpeg.loaded) {
        ffmpeg.on("log", ({ message }) => {
          console.log(message, "success");
        });

        await ffmpeg.load({
          coreURL,
          wasmURL,
        });
      }
      if (ffmpeg.loaded) addToast("FFmpeg initialized successfully", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "FFmpeg initialization failed";
      setErrorMessage(message);
      addToast(message, "error");
    }
  }, []);

  useEffect(() => {
    loadFFmpeg();
  }, [loadFFmpeg]);


  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith("audio/")) {
      setErrorMessage("Please upload an audio file");
      return false;
    }

    setErrorMessage("");
    return true;
  };

  const handleFileChange = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 1) {
      setErrorMessage("Please upload only one file");
      return;
    }

    const file = files[0];
    handleFileChange(file);
    addToast("File uploaded successfully", "success");
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
      addToast("File uploaded successfully", "success");
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const processAudio = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMessage("");
    abortControllerRef.current = new AbortController();

    try {
      const inputName = sanitizeName(`${selectedFile.name}`);
      const outputName = sanitizeName(`${selectedFile.name}.wav`);

      // Write and process file
      const fetchPayload = await fetchFile(selectedFile);
      await ffmpeg.writeFile(inputName, fetchPayload);
      await ffmpeg.exec([
        "-i",
        inputName,
        "-ar",
        "24000",
        "-ac",
        "1",
        "-f",
        "wav",
        outputName,
      ]);

      // Read and decode audio
      const wavData = (await ffmpeg.readFile(outputName)) as Uint8Array;
      const processedFile = new File(
        [new Blob([wavData], { type: "audio/wav" })],
        outputName,
        { type: "audio/wav" }
      );
      //Upload the processed file to the backend
      const formData = new FormData();
      formData.append("audio", processedFile);

      const response = await fetch("http://localhost:8000/decode", {
        method: "POST",
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      if (response) addToast("File processed successfully!", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Processing failed";
      setErrorMessage(message);
      addToast(message, "error");
      setTimeout(() => {
        setErrorMessage("");
        setSelectedFile(null);
      }, 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    abortControllerRef.current?.abort();
    setSelectedFile(null);
    setErrorMessage("");
  };

  return (
    <div
      className={`upload-container ${isDragActive ? "drag-active" : ""} ${
        errorMessage ? "error" : ""
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        onChange={handleInputChange}
        className="hidden-input"
        id="audio-upload"
      />

      {!selectedFile ? (
        <label htmlFor="audio-upload" className="upload-label">
          <div className="upload-content">
            <span className="upload-icon">🎵</span>
            <p>Drag and drop audio file here, or click to upload</p>
            <p className="supported-formats">
              Supported formats: MP3, WAV, AAC
            </p>
          </div>
        </label>
      ) : (
        <div className="file-info">
          <div className="file-details">
            <span className="file-name">{selectedFile.name}</span>
            <span className="file-size">{selectedFile.size}</span>
          </div>
          <div className="action-buttons">
            <button
              className="process-button"
              onClick={processAudio}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Process File"}
            </button>
            <button className="remove-button" onClick={handleRemoveFile}>
              Remove File
            </button>
          </div>
        </div>
      )}
      {errorMessage ? (
        <div className="error-message">{errorMessage}</div>
      ) : null}
    </div>
  );
};

export default AudioUpload;
