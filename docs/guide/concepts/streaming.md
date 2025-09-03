## Streaming

lazy API 的另一个好处是它允许以流的方式执行查询。Polars 无需一次性处理所有数据，而是可以批量执行查询，从而能够处理内存无法容纳的数据集。除了内存压力之外，流式引擎的性能也比 Polars 的内存引擎更高。

想要在 Polars 中以流模式执行查询，需要在使用`collect`时指定参数`engine="streaming"`：
```python title="Python"
q1 = (
    pl.scan_csv("polars\iris\iris.csv")
    .filter(pl.col("sepal_length") > 5)
    .group_by("species")
    .agg(pl.col("sepal_width").mean())
)
df = q1.collect(engine="streaming")
```
```text
shape: (3, 2)
┌─────────────────┬─────────────┐
│ species         ┆ sepal_width │
│ ---             ┆ ---         │
│ str             ┆ f64         │
╞═════════════════╪═════════════╡
│ Iris-versicolor ┆ 2.804255    │
│ Iris-setosa     ┆ 3.713636    │
│ Iris-virginica  ┆ 2.983673    │
└─────────────────┴─────────────┘
```


## 查看流式执行计划

Polar 可以以流式方式运行许多操作。有些操作本质上是非流式的，或者尚未以流式方式实现。在后一种情况下，Polar 将回退到内存引擎来执行这些操作。用户无需了解这一点，但它对于调试内存或性能问题可能很有用。

要检查流式查询的物理计划，可以绘制物理图。图例显示了操作的内存占用情况

> 需要先安装graphviz环境，[下载地址](https://graphviz.org/download/)


```python title="Python" {15}
import polars as pl
import matplotlib
matplotlib.use('TkAgg')  # 更换为TkAgg后端,处理Matplotlib与PyCharm集成存在的兼容性问题

if __name__ == '__main__':

    q1 = (
        pl.scan_csv("polars\iris\iris.csv")
        .filter(pl.col("sepal_length") > 5)
        .group_by("species")
        .agg(
            mean_width=pl.col("sepal_width").mean(),
            mean_width2=pl.col("sepal_width").sum() / pl.col("sepal_length").count(),
        )
        .show_graph(plan_stage="physical", engine="streaming")
    )

```



