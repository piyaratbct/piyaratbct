import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, collection, query, getDocs, where } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
// We don't have permission to read from node js. So I'll just change the React code.
