import { Point, calcSimilarity } from "./knn";

type Graph<DataType> = Array<{
    point: Point<DataType>;
    edges: number[];
}>;

function constructGraph<DataType>(
    points: Array<Point<DataType>>
): Graph<DataType> {
    const graph: Graph<DataType> = [];

    for (const point of points) {
        const edges: number[] = [];

        for (let i = 0; i < 5; i++) {
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

    return graph;
}

function search<DataType>(
    target: Point<DataType>,
    graph: Graph<DataType>
): Array<Point<DataType>> {
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

    // greedy bfs
    // TODO: keep track of most similar points
    // TODO: create stop condition
    while (q.length !== 0) {
        const current = q.shift()!;
        for (const nextIndex of graph[current.index].edges) {
            // if this node has been visited skip
            if (visited[nextIndex]) continue;
            // mark this node as visited for future runs
            visited[nextIndex] = true;

            const sim = calcSimilarity(target, graph[nextIndex].point);

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

    return [];
}
