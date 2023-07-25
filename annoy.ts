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

export function constructTree<DataType>(
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

export function searchAnnoy<DataType>(
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

export function constructNTrees<DataType>(
    points: Point<DataType>[],
    k: number,
    n: number
) {
    const trees = new Array(n);

    for (let i = 0; i < n; i++) {
        trees[i] = constructTree(points, k);
    }

    return trees;
}

export function searchAnnoyMany<DataType>(
    target: Point<DataType>,
    trees: AnnoyNode<DataType>[],
    k: number = 5
): Array<{ point: Point<DataType>; sim: number }> {
    const results: Array<Point<DataType>> = [];

    for (const tree of trees) {
        results.push(...searchAnnoy(target, tree, k));
    }

    const seenIndex: {
        [key: string]: boolean;
    } = {};

    return results
        .map(x => ({ sim: calcSimilarity(target, x), point: x }))
        .filter(p => {
            if (seenIndex[p.point.data as string]) {
                return false;
            } else {
                seenIndex[p.point.data as string] = true;
                return true;
            }
        })
        .sort((a, b) => b.sim - a.sim)
        .slice(0, k);
}
