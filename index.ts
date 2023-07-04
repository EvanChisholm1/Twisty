interface Point<DataType> {
    embedding: number[];
    size: number;
    data: DataType;
}

interface Layer {
    points: Array<{
        point: number;
        connections: number[];
    }>;
}

interface Index<DataType> {
    layers: Layer[];
    points: Point<DataType>[];
}

function constructIndex<DataType>(
    rawPoints: Point<DataType>[],
    numberOfLayers: number
): Index<DataType> {
    return { layers: [], points: [] };
}

function probabilityInsert(levelMultiplier: number) {}
