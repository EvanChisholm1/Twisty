import { readFileSync } from "fs";
import { Point, knn } from "./knn";
import { constructGraph, search } from "./vamana";

const file: string = readFileSync("./arxiv-titles.json", "utf-8")!;
const embeddings: Point<string>[] = JSON.parse(file);

// KNN brute force benchmark
const timesKNN: number[] = [];

const globalStart = Date.now();
for (let i = 0; i < 1000; i++) {
    const embeddingIndex = Math.round(Math.random() * 999);

    const start = Date.now();
    const mostSimilar = knn(embeddings[embeddingIndex], embeddings, 10);
    const end = Date.now();

    timesKNN.push(end - start);
}

const globalEnd = Date.now();
const totalTime = globalEnd - globalStart;

const averageTimeMs = timesKNN.reduce((acc, cur) => acc + cur) / 1000;
console.log("KNN average time", averageTimeMs);
console.log("KNN total time", totalTime);

// diskANN/vamana benchmark
const timesDiskANN: number[] = [];
for (let i = 0; i < 1000; i++) {
    const embeddingIndex = Math.round(Math.random() * 999);

    // don't include construction of graph in time because in real world graph would be created once and used many times
    const g = constructGraph(embeddings);

    const start = Date.now();
    const mostSimilar = search(embeddings[embeddingIndex], g, 10);
    const end = Date.now();
    // console.log(end - start);

    timesDiskANN.push(end - start);
}

const diskANNTotalTimeMs = timesDiskANN.reduce((acc, cur) => acc + cur);
const diskANNAvgTimeMs = diskANNTotalTimeMs / 1000;

console.log("DiskANN average time:", diskANNAvgTimeMs);
console.log("DiskANN Total Time:", diskANNTotalTimeMs);
