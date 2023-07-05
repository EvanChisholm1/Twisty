import fs from "fs";

interface Point<DataType> {
    embedding: number[];
    size: number;
    data: DataType;
}

const file: string = fs.readFileSync("./arxiv-titles.json", "utf-8")!;
const embeddings: Point<string>[] = JSON.parse(file);

// embeddings.forEach((e, i) => console.log(i, e.data));

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
    const mostSimilar: Array<{
        point: Point<DataType> | null;
        similarity: number;
    }> = new Array(k).fill({ point: null, similarity: 0 });

    for (const point of points) {
        const sim = calcSimilarity(target, point);
        // not the fastest if k is quite large, will likely switch to binary search at some point
        // time complextiy with binary search would become O(n * log(k)) instead of O(nk)
        for (const [i, previousPoint] of mostSimilar.entries()) {
            if (!(sim > previousPoint.similarity)) continue;

            mostSimilar.splice(i, 0, { point, similarity: sim });
            mostSimilar.pop();
            break;
        }
    }

    return mostSimilar;
}

const mostSimilar = knn(embeddings[690], embeddings.slice(1), 10);

for (const point of mostSimilar) {
    console.log(point.point?.data);
}
