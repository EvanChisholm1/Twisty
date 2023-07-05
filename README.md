# Twisty

Twisty is a vector database written from scratch in pure typescript. Currently it isn't really much of anything but it is a kind of playground for me to learn about and implement various various Vector similarity algorithims such as Annoy (a tree based algorithm created at spotify) and HNSW (a graph based algorithm). Right now it only has KNN or brute force implemented.

## Benchmarks

Here are some benchmarks of the various algorithms implemented running on my computer with an i7 7700 and 16gb of ram:

| Algorithm | Average Time Over 5 Runs |
| --------- | ------------------------ |
| KNN       | 28.97                    |

Eventually I will have multiple algorithims, specifically Annoy, and HNSW, as well as comparisons to other popular libraries and projects. The goal is to become the fastest JavaScript/TypeScript based vector database.
