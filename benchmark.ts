import { readFileSync } from "fs";
import { Point, knn } from "./knn";

const file: string = readFileSync("./arxiv-titles.json", "utf-8")!;
const embeddings: Point<string>[] = JSON.parse(file);

const times: number[] = [];

const globalStart = Date.now();
for (let i = 0; i < 1000; i++) {
    const embeddingIndex = Math.round(Math.random() * 999);

    const start = Date.now();
    const mostSimilar = knn(embeddings[embeddingIndex], embeddings, 10);
    const end = Date.now();

    times.push(end - start);
}

const globalEnd = Date.now();
const totalTime = globalEnd - globalStart;

const averageTimeMs = times.reduce((acc, cur) => acc + cur / 1000);
console.log("KNN average time", averageTimeMs);
console.log("KNN total time", totalTime);
