import { readFileSync } from "fs";
import { Point, knn } from "./knn";
import { constructGraph, search } from "./vamana";
import { searchRandom } from "./random";

console.log("loading file...");
// const file: string = readFileSync("./arxiv-titles.json", "utf-8")!;
const file: string = readFileSync("./arxiv-titles-10k.json", "utf-8")!;
const embeddings: Point<string>[] = JSON.parse(file);

// let embeddings: Point<string>[] = [];
// for (let i = 0; i < 10; i++) {
//     const file: string = readFileSync(
//         `./arxiv-titles-100k-${i}.json`,
//         "utf-8"
//     )!;
//     const jsonEmbeddings: Point<string>[] = JSON.parse(file);
//     embeddings = [...embeddings, ...jsonEmbeddings];
// }

console.log("File Loaded!", "\n");

// KNN brute force benchmark
const timesKNN: number[] = [];
const KNNAvgSimilarities: number[] = [];

const globalStart = Date.now();
for (let i = 0; i < 1000; i++) {
    const embeddingIndex = Math.round(Math.random() * 999);

    const start = Date.now();
    const mostSimilar = knn(embeddings[embeddingIndex], embeddings, 10);
    const end = Date.now();

    timesKNN.push(end - start);

    const avgSimilarity =
        mostSimilar.reduce((acc, cur) => acc + cur.similarity, 0) / 10;
    KNNAvgSimilarities.push(avgSimilarity);
}

const globalEnd = Date.now();

const totalTime = globalEnd - globalStart;
const averageTimeMs = timesKNN.reduce((acc, cur) => acc + cur) / 1000;
const KNNAvgSimilartiy =
    KNNAvgSimilarities.reduce((acc, cur) => acc + cur) / 1000;

console.log("KNN average time", averageTimeMs);
console.log("KNN total time", totalTime);
console.log("KNN average similarity", KNNAvgSimilartiy, "\n");

// diskANN/vamana benchmark
const timesDiskANN: number[] = [];
const diskANNSimilarities: number[] = [];

const g = constructGraph(embeddings, 5);

for (let i = 0; i < 1000; i++) {
    const embeddingIndex = Math.round(Math.random() * 999);

    // don't include construction of graph in time because in real world graph would be created once and used many times

    const start = Date.now();
    const { mostSimilar } = search(embeddings[embeddingIndex], g, 10);
    const end = Date.now();
    // console.log(end - start);

    timesDiskANN.push(end - start);

    const avgSimilarity =
        mostSimilar.reduce((acc, cur) => acc + cur.similarity, 0) / 10;
    diskANNSimilarities.push(avgSimilarity);
}

const diskANNAvgSimilarity =
    diskANNSimilarities.reduce((acc, cur) => acc + cur) / 1000;

const diskANNTotalTimeMs = timesDiskANN.reduce((acc, cur) => acc + cur);
const diskANNAvgTimeMs = diskANNTotalTimeMs / 1000;

console.log("DiskANN average time:", diskANNAvgTimeMs);
console.log("DiskANN Total Time:", diskANNTotalTimeMs);
console.log("DiskANN average similarity:", diskANNAvgSimilarity);

// random benchmark
const randomTimes: number[] = [];
const randomAverageSimilarities: number[] = [];

for (let i = 0; i < 1000; i++) {
    const embeddingIndex = Math.round(Math.random() * 999);

    const start = Date.now();
    const mostSimilar = searchRandom(
        embeddings[embeddingIndex],
        embeddings,
        10
    );
    const end = Date.now();

    randomTimes.push(end - start);

    const avgSimilarity =
        mostSimilar.reduce((acc, cur) => acc + cur.similarity, 0) / 10;
    randomAverageSimilarities.push(avgSimilarity);
}

const randomAverageSim =
    randomAverageSimilarities.reduce((acc, cur) => acc + cur) / 1000;

const randomAverageTime = randomTimes.reduce((acc, cur) => acc + cur) / 1000;

console.log("Random Average Time:", randomAverageTime);
console.log("Random Average Similarity:", randomAverageSim);
