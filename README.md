# Twisty

Twisty is a vector database written from scratch in pure typescript. Currently it isn't really much of anything but it is a kind of playground for me to learn about and implement various various Vector similarity algorithims such as Annoy (a tree based algorithm created at spotify) and HNSW (a graph based algorithm). Right now it only has KNN or brute force implemented.

## Benchmarks

Here are some benchmarks of the various algorithms implemented running on my computer with an i7 7700 and 16gb of ram:

### Benchmark on Small Dataset of 1000 Arxiv Titles

| Algorithm      | Average Time Over 5 Runs | Average Similarity |
| -------------- | ------------------------ | ------------------ |
| KNN            | 2.4058ms                 | 0.7422             |
| DiskANN/Vamana | 0.822ms                  | 0.6952             |

### Benchmark on Dataset of 10k Arxiv Titles

| Algorithm      | Average Time Over 5 Runs | Average Similarity |
| -------------- | ------------------------ | ------------------ |
| KNN            | 24.35                    | 0.78201            |
| DiskANN/Vamana | 1.25                     | 0.68904            |

Keep in mind the similarity scores for DiskANN are currently with a rather low amount of connections per node at 5 and no fancy graph optimizations yet.

Eventually I will have multiple algorithims, specifically Annoy, and HNSW, as well as comparisons to other popular libraries and projects. The goal is to become the fastest JavaScript/TypeScript based vector database.

More benchmarks coming soon with recal metrics and larger datasets.
