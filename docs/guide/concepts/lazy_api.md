## 惰性API

Polars支持两种操作模式: `lazy` 和 `eager`, 之前的示例都是使用的 `eager`, 即查询会立即执行。 但在Lazy模式中, 查询只会在使用了`collect`后执行。将执行推迟到最后一刻可以带来显著的性能优势，这也是为什么在大多数情况下首选惰性执行 (lazy) API 的原因。

- eager模式：立即执行查询，适合需要看中间数据的情况。
- lazy模式：惰性查询，只会在最后才进行查询。


### 示例

::: tip 数据准备
[下载官方提供的数据集](https://archive.ics.uci.edu/dataset/53/iris) 
官方数据文件格式和官方文档上已经有点不一样了，所以需要手动处理一下。将iris.data文件改为iris.csv，并且在最开始一行加入表头：sepal_length,sepal_width,height,width,species。主要是几个后续用到的列名称，其他列的名称无所谓。如下所示：
```text title="iris.csv"
sepal_length,sepal_width,height,width,species
5.1,3.5,1.4,0.2,Iris-setosa
4.9,3.0,1.4,0.2,Iris-setosa
4.7,3.2,1.3,0.2,Iris-setosa
4.6,3.1,1.5,0.2,Iris-setosa
······
```

:::


```python title="Python"
df = pl.read_csv("polars\iris\iris.csv")
df_small = df.filter(pl.col("sepal_length") > 5)
df_agg = df_small.group_by("species").agg(pl.col("sepal_width").mean())
print(df_agg)
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
在此示例中，使用 Eager API 来执行操作流程如下： 
1.  读取鸢尾花数据集。
2. 根据萼片长度过滤数据集。
3. 计算每个物种的萼片宽度的平均值。

每个步骤都会立即执行并返回中间结果。这可能非常消耗资源，因为可能会执行一些工作或加载一些未使用的额外数据。如果改用惰性 API，并等待所有步骤都定义完成后再执行，那么查询规划器就可以进行各种优化。在这种情况下：
- 谓词下推：在读取数据集时尽早应用过滤器，从而仅读取萼片长度大于 5 的行。
- 投影下推：读取数据集时仅选择所需的列，从而无需加载额外的列（例如花瓣长度和花瓣宽度）。

```python title="Python"
q = (
    pl.scan_csv("polars\iris\iris.csv")
    .filter(pl.col("sepal_length") > 5)
    .group_by("species")
    .agg(pl.col("sepal_width").mean())
)
df = q.collect()
print(df)
```
```text
shape: (3, 2)
┌─────────────────┬─────────────┐
│ species         ┆ sepal_width │
│ ---             ┆ ---         │
│ str             ┆ f64         │
╞═════════════════╪═════════════╡
│ Iris-virginica  ┆ 2.983673    │
│ Iris-setosa     ┆ 3.713636    │
│ Iris-versicolor ┆ 2.804255    │
└─────────────────┴─────────────┘
```
这些将显著降低内存和 CPU 的负载，从而能够在内存中容纳更大的数据集并更快地处理它们。定义查询后，可以调用`collect`来通知 Polars 要执行该查询。




## 预览查询计划

使用`lazy`api时，可以使用函数explain要求`Polars`创建查询计划的描述, 该描述将在收集结果后执行。对于用来了解 Polars 对查询做了哪些类型的优化非常有用。用法如下：
```python title="Python"
print(q.explain())
```
然后输出结果如下：
```text
AGGREGATE[maintain_order: false]
  [col("sepal_width").mean()] BY [col("species")]
  FROM
  Csv SCAN [polars\iris\iris.csv]
  PROJECT 3/5 COLUMNS
  SELECTION: [(col("sepal_length")) > (5.0)]
```
在结果中可以看见，Polars 确实应用了谓词下推，因为它只读取萼片长度大于 5 的行，并且它确实应用了投影下推，因为它只读取查询所需的列。



## 使用`lazy`模式
:::tip

- 以下只是简单示例如何使用, 具体是否使用`lazy`模式取决于数据集大小和查询
- 数据集小时, 使用`eager`模式可能会更快, 因为生成查询计划需要时间

:::

可以使用`lazy()`方法将DataFrame转换为LazyDataFrame.

最后使用`collect()`收集所有查询步骤并返回结果

```python title="Python"
import polars as pl

df: pl.DataFrame = pl.DataFrame({
    "name": ["Alice", "Bob", "Charlie", "David"],
    "age": [25, 35, 30, 40],
    "city": ["NY", "LA", "NY", "SF"]
})

lazy_df: pl.LazyFrame = df.lazy()

query = (
    lazy_df
    .filter(pl.col("age") > 30)
    .select(pl.col("name"),pl.col("age"))
)
print(query.explain())
print(query.collect())
```

```text
FILTER [(col("age")) > (30)]
FROM
  DF ["name", "age", "city"]; PROJECT["name", "age"] 2/3 COLUMNS
shape: (2, 2)
┌───────┬─────┐
│ name  ┆ age │
│ ---   ┆ --- │
│ str   ┆ i64 │
╞═══════╪═════╡
│ Bob   ┆ 35  │
│ David ┆ 40  │
└───────┴─────┘
```