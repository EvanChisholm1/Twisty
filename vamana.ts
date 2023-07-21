import { Point, calcSimilarity } from "./knn";
import { readFileSync } from "fs";

type Graph<DataType> = Array<{
    point: Point<DataType>;
    edges: number[];
}>;

function robustPrune<DataType>(
    point: { point: Point<DataType>; edges: number[] },
    graph: Graph<DataType>,
    candidateSet: number[],
    distanceThreshold: number,
    numberOfConnections: number
): number[] {
    const newConnections: number[] = [];
    const allCandidates = [...point.edges, ...candidateSet].sort(
        (a, b) =>
            calcSimilarity(point.point, graph[a].point) -
            calcSimilarity(point.point, graph[b].point)
    );

    while (allCandidates.length > 0) {
        const next = allCandidates[0];
        const nextPoint = graph[next];
        newConnections.push(next);

        if (newConnections.length === numberOfConnections) break;

        for (let i = allCandidates.length - 1; i >= 0; i--) {
            const candidate = graph[allCandidates[i]];
            if (
                distanceThreshold *
                    (1 - calcSimilarity(nextPoint.point, candidate.point)) <=
                1 - calcSimilarity(point.point, candidate.point)
            ) {
                allCandidates.splice(i, 1);
            }
        }
    }

    return newConnections;
}

export function constructGraph<DataType>(
    points: Array<Point<DataType>>,
    numberOfEdges: number = 5
): Graph<DataType> {
    const graph: Graph<DataType> = [];

    for (const point of points) {
        const edges: number[] = [];

        for (let i = 0; i < numberOfEdges; i++) {
            const edge = Math.round(Math.random() * (points.length - 1));
            edges.push(edge);
        }

        graph.push({
            point,
            edges,
        });
    }

    // TODO: optimize graph with both long and short connections
    // TODO: make sure graph is fully connected
    const a = [1, 3];

    for (let r = 0; r < 2; r++) {
        for (let i = 0; i < graph.length; i++) {
            const visited = search(
                graph[i].point,
                graph,
                1,
                numberOfEdges + 5
            ).visited;

            graph[i].edges = robustPrune(
                graph[i],
                graph,
                [...Object.entries(visited).map(([key]) => parseInt(key))],
                a[r],
                numberOfEdges
            );

            for (let j = 0; j < graph[i].edges.length; j++) {
                if (graph[j].edges.length + 1 > numberOfEdges) {
                    graph[j].edges = robustPrune(
                        graph[j],
                        graph,
                        [...graph[j].edges, i],
                        a[r],
                        numberOfEdges
                    );
                } else {
                    graph[j].edges.push(i);
                }
            }
        }
    }

    return graph;
}

// need to fix bug where most similar becomes the same pont repeated
export function search<DataType>(
    target: Point<DataType>,
    graph: Graph<DataType>,
    k: number,
    l: number = k
): {
    mostSimilar: Array<{ point: Point<DataType>; similarity: number }>;
    visited: { [key: number]: boolean };
} {
    // visited map, keeps track of which nodes in the graph have and have not been vistited
    const visited: {
        [key: number]: boolean;
    } = {};

    // entry point
    const entryPointIndex = Math.round(Math.random() * (graph.length - 1));
    const entryPoint = graph[entryPointIndex].point;
    const entrySimilarity = calcSimilarity(target, entryPoint);

    // setup queue
    // keeps track of which nodes to search next
    const q: Array<{
        index: number;
        similarity: number;
        point: Point<DataType>;
    }> = [
        {
            index: entryPointIndex,
            similarity: entrySimilarity,
            point: entryPoint,
        },
    ];

    let mostSimilar: Array<{
        point: Point<DataType>;
        similarity: number;
    }> = new Array(l).fill({ point: entryPoint, similarity: 0 });

    // greedy bfs
    let searched = 0;
    while (q.length !== 0) {
        const current = q.shift()!;
        searched++;

        for (const [i, previousPoint] of mostSimilar.entries()) {
            if (previousPoint.point.data === current.point.data) break;
            if (!(current.similarity > previousPoint.similarity)) continue;

            mostSimilar.splice(i, 0, {
                point: current.point,
                similarity: current.similarity,
            });
            mostSimilar.pop();
            break;
        }

        for (const nextIndex of graph[current.index].edges) {
            // if this node has been visited skip
            if (visited[nextIndex]) continue;
            // mark this node as visited for future runs
            visited[nextIndex] = true;

            const sim = calcSimilarity(target, graph[nextIndex].point);

            // if the next point is less similar than the least similar node in the list of most similar nodes then don't search that direction
            // this is the part that makes the algorithim greedy, not sure if it's the best way to do it especially with the current graph
            // will have to read the paper on DiskANN and how they optimize the graph
            if (sim < mostSimilar[mostSimilar.length - 1].similarity) continue;

            // find spot in q where it belongs so the q is sorted by similarity
            let isInserted = false;
            for (const [i, p] of q.entries()) {
                if (!(sim > p.similarity)) continue;

                q.splice(i, 0, {
                    point: graph[nextIndex].point,
                    similarity: sim,
                    index: nextIndex,
                });
                isInserted = true;
                break;
            }
            // if it wasn't inserted in the above search because it's similarity is lower than everything else append to the end
            if (!isInserted)
                q.push({
                    point: graph[nextIndex].point,
                    similarity: sim,
                    index: nextIndex,
                });
        }
    }

    // console.log(mostSimilar);
    // console.log("nodes searched:", searched);

    return { mostSimilar, visited };
}

// const file: string = readFileSync("./arxiv-titles.json", "utf-8")!;
// const embeddings: Point<string>[] = JSON.parse(file);

// const g = constructGraph(embeddings.slice(1));
// console.log("starting point:", embeddings[0]);

// const start = Date.now();
// search(embeddings[0], g, 10);
// const end = Date.now();

// console.log("time:", end - start);
