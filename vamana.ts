import { Point } from "./knn";

type Graph<DataType> = Array<{
    point: Point<DataType>;
    edges: number[];
}>;

function constructGraph<DataType>(
    points: Array<Point<DataType>>
): Graph<DataType> {
    return [];
}

function search<DataType>(
    target: Point<DataType>,
    graph: Graph<DataType>
): Array<Point<DataType>> {
    const visited: {
        [key: number]: boolean;
    } = {};
    const q: number[] = [Math.round(Math.random() * (graph.length - 1))];

    while (q.length !== 0) {
        const current: number = q.shift()!;
        for (const next of graph[current].edges) {
            if (visited[next]) continue;
            // TODO: calculate similarity between next node and target node then put into queue accordingly
        }
    }

    return [];
}
