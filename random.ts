import { Point, calcSimilarity } from "./knn";

export function searchRandom<DataType>(
    target: Point<DataType>,
    embeddings: Point<DataType>[],
    k: number
) {
    const points: Array<{
        point: Point<DataType>;
        similarity: number;
    }> = [];
    for (let i = 0; i < k; i++) {
        const point =
            embeddings[Math.round(Math.random() * (embeddings.length - 1))];
        const sim = calcSimilarity(target, point);
        points.push({
            point,
            similarity: sim,
        });
    }

    return points;
}
