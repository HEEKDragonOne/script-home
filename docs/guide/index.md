:::tip 速度极快的 DataFrame 库
`Polars` 是一个用于处理结构化数据的超快 `DataFrame` 库。其核心使用 `Rust` 编写，并支持 Python、R 和 NodeJS 语言。
:::

## 主要特点

- 快速：用 Rust 从头编写，设计接近机器并且没有外部依赖。
- I/O：对所有常见数据存储层的一流支持：本地、云存储和数据库。
- 直观的 API：按照预期的方式编写查询。Polars 内部会使用其查询优化器确定最高效的执行方式。
- 核心外：流式 API 允许您处理结果，而无需所有数据同时位于内存中。
- 并行：通过在可用的 CPU 核心之间分配工作负载来充分利用机器的功能，无需任何额外的配置。
- 矢量化查询引擎
- GPU 支持：可选择在 NVIDIA GPU 上运行查询，以实现内存工作负载的最佳性能。
- Apache Arrow 支持：Polars 通常可以使用零拷贝操作来消费和生成 Arrow 数据。需要注意的是，Polars 并非基于 Pyarrow/Arrow 实现构建。相反，Polars 拥有自己的计算和缓冲区实现。

:::details DataFrame介绍
DataFrame 是一种二维数据结构，可用于数据操作和分析，类似于Excel。DataFrame 的行和列分别带有标记轴，每列可以包含不同的数据类型，从而简化诸如合并和聚合等复杂的数据操作。DataFrame 凭借其灵活性以及直观的数据存储和处理方式，在现代数据分析和工程领域日益流行。
:::

## 体系

Polars 的目标是提供一个闪电般快速的`DataFrame`库:

- 利用机器上所有可用的核心。
- 优化查询以减少不必要的工作/内存分配。
- 处理比可用 RAM 大得多的数据集。
- 一致且可预测的 API。
- 遵循严格的模式（运行查询之前应该知道数据类型）。

Polars 是用 Rust 编写的，这使其具有 C/C++ 性能，并允许它完全控制查询引擎中性能关键的部分。

## 示例

```python title="python"
import polars as pl

q = (
    pl.scan_csv("demo.csv")
    .filter(pl.col("sepal_length") > 5)
    .group_by("species")
    .agg(pl.all().sum())
)

df = q.collect()
```
