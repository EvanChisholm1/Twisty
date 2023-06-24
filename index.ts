console.log("hello world")

interface Point {
    embedding: number[];
    
}

interface Layer {
    points: Array<{
        point: Point,
        connections: number[]
    }>;
}
