// friendship ended with diskANN, Annoy is my new best friend
import { Point, calcSimilarity } from "./knn";
import { readFileSync } from "fs";

type AnnoyNode<DataType> =
    | {
          left: AnnoyNode<DataType>;
          right: AnnoyNode<DataType>;
          plane: number[];
          midpoint: number[];
      }
    | Point<DataType>[];

interface AnnoyIndex<DataType> {
    node: AnnoyNode<DataType>;
}

function splitVectors<DataType>(points: Point<DataType>[]) {
    const v1 = points[Math.round(Math.random() * (points.length - 1))];
    const v2 = points[Math.round(Math.random() * (points.length - 1))];

    // midpoint of v2 and v1
    const midpoint = v1.embedding
        .map((a, i) => a + v2.embedding[i])
        .map(x => x / 2);
    // calculate norm of plane
    let plane = v1.embedding.map((a, i) => a - v2.embedding[i]);
    const planeNorm = Math.sqrt(plane.reduce((acc, cur) => acc + cur ** 2));
    plane = plane.map((x, i) => x / planeNorm);

    const distances = points.map((p, i) => ({
        sim: calcSimilarity(
            { embedding: plane, data: null, size: plane.length },
            {
                embedding: p.embedding.map((x, i) => x - midpoint[i]),
                data: null,
                size: plane.length,
            }
        ),
        index: i,
    }));

    const leftVectors = distances
        .filter(p => (p.sim <= 0 ? true : false))
        .map(p => points[p.index]);
    const rightVectors = distances
        .filter(p => (p.sim > 0 ? true : false))
        .map(p => points[p.index]);

    return { leftVectors, rightVectors, plane, midpoint };
}

function constructTree<DataType>(
    points: Point<DataType>[],
    k: number
): AnnoyNode<DataType> {
    const { leftVectors, rightVectors, plane, midpoint } = splitVectors(points);

    const currentNode: AnnoyNode<DataType> = {
        left:
            leftVectors.length <= k
                ? leftVectors
                : constructTree(leftVectors, k),
        right:
            rightVectors.length <= k
                ? rightVectors
                : constructTree(rightVectors, k),
        plane,
        midpoint,
    };

    return currentNode;
}
