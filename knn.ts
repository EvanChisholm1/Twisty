import fs from "fs";

interface Point<DataType> {
    embedding: number[];
    size: number;
    data: DataType;
}

const file: string = fs.readFileSync("./arxiv-titles.json", "utf-8")!;
const embeddings: Point<string>[] = JSON.parse(file);

function calcSimilarity<DataType>(
    pointA: Point<DataType>,
    pointB: Point<DataType>
) {
    // dot product
    const nonNormSimilarity: number = pointA.embedding.reduce(
        (acc, cur, i) => acc + cur * pointB.embedding[i]
    );

    const aNorm = Math.sqrt(
        pointA.embedding.reduce((acc, cur) => acc + cur ** 2)
    );
    const bNorm = Math.sqrt(
        pointB.embedding.reduce((acc, cur) => acc + cur ** 2)
    );

    const similarity = nonNormSimilarity / (aNorm * bNorm);
    return similarity;
}

function knn<DataType>(
    target: Point<DataType>,
    points: Point<DataType>[],
    k: number
) {
    const ks: Point<DataType>[] = [];
    let mostSimilar: { point: Point<DataType> | null; similarity: number } = {
        point: null,
        similarity: 0,
    };

    for (const point of points) {
        const sim = calcSimilarity(target, point);
        if (sim > mostSimilar.similarity) {
            mostSimilar.point = point;
            mostSimilar.similarity = sim;
        }
    }

    console.log(mostSimilar.point?.data);
    return mostSimilar;
}

knn(embeddings[0], embeddings.slice(1), 1);
