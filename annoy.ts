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

function searchAnnoy<DataType>(
    target: Point<DataType>,
    tree: AnnoyNode<DataType>,
    k: number = 5
): Array<Point<DataType>> {
    if (Array.isArray(tree)) return tree;
    const translatedPoint = target.embedding.map(
        (x, i) => x - tree.midpoint[i]
    );
    const sim = calcSimilarity(
        {
            embedding: translatedPoint,
            data: null,
            size: translatedPoint.length,
        },
        { embedding: tree.plane, data: null, size: translatedPoint.length }
    );

    const results = searchAnnoy(target, sim <= 0 ? tree.left : tree.right);
    if (results.length >= k) return results;

    return [
        ...results,
        ...searchAnnoy(target, sim <= 0 ? tree.right : tree.left),
    ].slice(0, k);
}

const file: string = readFileSync("./arxiv-titles-10k.json", "utf-8")!;
const embeddings: Point<string>[] = JSON.parse(file);

const t = constructTree(embeddings, 5);

const start = Date.now();
const results = searchAnnoy(embeddings[0], t, 5);
const end = Date.now();
console.log(results);
console.log("Time to search:", end - start);
const avgSim =
    results.reduce((acc, cur) => acc + calcSimilarity(embeddings[0], cur), 0) /
    5;
console.log(avgSim);

// console.log(t);
