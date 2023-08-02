# Twisty

Twisty is a vector database written from scratch in pure typescript. Currently it isn't really much of anything but it is a kind of playground for me to learn about and implement various various Vector similarity algorithims such as Annoy (a tree based algorithm created at spotify) and HNSW (a graph based algorithm). Right now it only has KNN or brute force implemented.

## Benchmarks

Here are some benchmarks of the various algorithms implemented running on my computer with an i7 7700 and 16gb of ram:

### Benchmark on Small Dataset of 1000 Arxiv Titles

| Algorithm                  | Average Time Over 5 Runs | Average Similarity |
| -------------------------- | ------------------------ | ------------------ |
| KNN                        | 2.4058ms                 | 0.7422             |
| DiskANN/Vamana Full Random | 0.822ms                  | 0.6952             |
| DiskANN/Vamana Optimized   | 0.184ms                  | 0.6141             |
| Annoy                      | 0.294ms                  | 0.6208             |
| Annoy Many                 | 0.792ms                  | 0.7027             |
| Full Random Search         | 0.055ms                  | 0.5687             |

### Benchmark on Dataset of 10k Arxiv Titles

| Algorithm                  | Average Time Over 5 Runs | Average Similarity |
| -------------------------- | ------------------------ | ------------------ |
| KNN                        | 24.35                    | 0.78201            |
| DiskANN/Vamana Full Random | 1.25                     | 0.68904            |
| DiskANN/Vamana Optimized   | 0.3922                   | 0.68241            |
| Annoy                      | 0.2178                   | 0.62507            |
| Annoy Many                 | 1.368                    | 0.71328            |

Keep in mind the similarity scores for DiskANN are currently with a rather low amount of connections per node at 5 and no fancy graph optimizations yet.

Eventually I will have multiple algorithims, specifically Annoy, and HNSW, as well as comparisons to other popular libraries and projects. The goal is to become the fastest JavaScript/TypeScript based vector database.

More benchmarks coming soon with recal metrics and larger datasets.

## Pros and Cons of Different Algorithims

### KNN

Pros:

-   100% accuracy
-   Simple
-   No Additional Indexing Step

Cons:

-   O(N) time complextiy meaning as dataset gets larger the time it takes to search scales linearly

### DiskANN/Vamana with full random connections

Pros:

-   indexing step is pretty quick
-   decent accuracy
-   decent search time

Cons:

-   not particularly good in any metric

### DiskANN/Vamana Optimized graph

Pros:

-   good search time
-   decent accuracy

Cons:

-   Indexing step is incredibly slow, I can likely make this much faster but I am limited by my language a little bit

### Annoy

Pros:

-   Really fast Indexing
-   Really fast Search
-   Pretty simple to understand

Cons:

-   Not that great accuracy
-   need to get a bit luck with the indexing because you could have a tree that is really evenly spread out or you could have one that has one branch that is really deep.

### Annoy Many

Pros:

-   Pretty easily tunable by just adjusting the number of trees you want to make
-   Best ANN accuracy of my implementations
-   still decent search time
-   Good pretty fast indexing

Cons:

-   Memory usage as you have to store multiple trees in memory
-   When you use many trees it can get a fair bit slower than other algorithims when searching
