import * as onnx from 'onnxruntime-node';
import fetch from 'node-fetch';
import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import Department from '../models/departmentModel.js';   // ✅ import Department model

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let session = null;
const modelPath = path.join(__dirname, '..', 'models', 'onnx', 'yolo11m.onnx');

// YOLO classes (for reference / future use)
const yoloClasses = [
    'pothole', 'manhole cover', 'street light out', 'garbage', 'flooding',
    'broken pipe', 'graffiti', 'road damage'
];

// Map of detected object keys → DB department names
const departmentMapping = {
    'damaged road issues': 'Road Dept',
    'pothole issues': 'Road Dept',
    'illegal parking issues': 'Traffic Dept',
    'broken road sign issues': 'Road Dept',
    'fallen trees': 'Public Works Dept',
    'littering/garbage on public places': 'Garbage Dept',
    'vandalism issues': 'Public Works Dept',
    'dead animal pollution': 'Public Works Dept',
    'damaged concrete structures': 'Road Dept',
    'damaged electric wires and poles': 'Electricity Dept'
};

// Load ONNX model
export async function loadModel() {
    if (session) return;
    try {
        session = await onnx.InferenceSession.create(modelPath);
        console.log('ONNX YOLO model loaded successfully.');
    } catch (e) {
        console.error('Error loading YOLO ONNX model:', e);
        throw new Error("Failed to load YOLO ONNX model.");
    }
}

// Preprocess image (local path or URL) with sharp
export async function preprocessImageFromUrl(imagePathOrUrl) {
    try {
        let buffer;

        if (imagePathOrUrl.startsWith('http://') || imagePathOrUrl.startsWith('https://')) {
            const response = await fetch(imagePathOrUrl);
            if (!response.ok) throw new Error('Failed to fetch image from URL');
            const arrayBuffer = await response.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
        } else {
            const absolutePath = path.isAbsolute(imagePathOrUrl)
                ? imagePathOrUrl
                : path.join(process.cwd(), imagePathOrUrl);

            if (!fs.existsSync(absolutePath)) {
                throw new Error(`Local image not found: ${absolutePath}`);
            }
            buffer = fs.readFileSync(absolutePath);
        }

        // Convert image to PNG 640x640 for canvas
        const pngBuffer = await sharp(buffer).resize(640, 640).png().toBuffer();

        const image = await loadImage(pngBuffer);
        const canvas = createCanvas(640, 640);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, 640, 640);

        const imageData = ctx.getImageData(0, 0, 640, 640);
        const { data } = imageData;

        const floatData = new Float32Array(1 * 3 * 640 * 640);
        for (let i = 0; i < 640 * 640; i++) {
            floatData[i] = data[i * 4] / 255;               // R
            floatData[i + 640 * 640] = data[i * 4 + 1] / 255; // G
            floatData[i + 2 * 640 * 640] = data[i * 4 + 2] / 255; // B
        }

        return new onnx.Tensor('float32', floatData, [1, 3, 640, 640]);
    } catch (err) {
        console.error('Error in preprocessImageFromUrl:', err.message);
        throw err;
    }
}

// Resolve department from mapping + DB (create if missing)
async function resolveDepartment(issueKey) {
    const deptName = departmentMapping[issueKey];
    if (!deptName) {
        console.warn(`[ML Service] No department mapped for issue: ${issueKey}`);
        return null;
    }

    let department = await Department.findOne({ where: { name: deptName } });

    if (!department) {
        department = await Department.create({
            name: deptName,
            latitude: 0,
            longitude: 0
        });
        console.log(`[ML Service] Created missing department: ${deptName}`);
    }

    return department;
}

// Predict function
export async function predict(imageUrl) {
    if (!session) await loadModel();

    const inputTensor = await preprocessImageFromUrl(imageUrl);
    const inputName = session.inputNames[0];
    const results = await session.run({ [inputName]: inputTensor });

    // === Mock detection (SIMULATING real model output for testing) ===
    const mockDetectedObjects = [
        'pothole issues',  // → Road Dept
        'littering/garbage on public places', // → Garbage Dept
        'vandalism issues'// → Public Works Dept
    ];

    // FIX: Instead of looping and returning the first result, we randomly select one
    // to simulate different detection outcomes for testing.
    const randomIndex = Math.floor(Math.random() * mockDetectedObjects.length);
    const selectedIssue = mockDetectedObjects[randomIndex];

    console.log(`[ML Service] MOCK: Selected issue to report: ${selectedIssue}`);

    const dept = await resolveDepartment(selectedIssue);

    if (dept) {
        return dept.id; // Return the ID of the randomly selected department
    }

    // fallback → Public Works Dept id
    const fallback = await resolveDepartment('vandalism issues');
    return fallback.id;
}
