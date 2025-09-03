## 快速入门

本章旨在帮助您快速入门 Polars。它涵盖了该库的所有基本特性和功能，使新用户能够轻松熟悉从初始安装和设置到核心功能的基础知识。

## 安装 Polars

```bash title="Python"
pip install polars
```

## 读写数据

:::tip 示例
Polars 支持常见文件格式（例如 csv、json、parquet）、云存储（例如 S3、Azure Blob、BigQuery）和数据库（例如 postgres、mysql）的读写。下面，我们创建一个DataFrame，并展示如何将其写入磁盘并重新读取。
:::

```python title="Pyhton"
import polars as pl
import datetime as dt

df = pl.DataFrame(
    {
        "name": ["Alice Archer", "Ben Brown", "Chloe Cooper", "Daniel Donovan"],
        "birthdate": [
            dt.date(1997, 1, 10),
            dt.date(1985, 2, 15),
            dt.date(1983, 3, 22),
            dt.date(1981, 4, 30),
        ],
        "weight": [57.9, 72.5, 53.6, 83.1],  # (kg)
        "height": [1.56, 1.77, 1.65, 1.75],  # (m)
    }
)

print(df)
```

```bash
shape: (4, 4)
┌────────────────┬────────────┬────────┬────────┐
│ name           ┆ birthdate  ┆ weight ┆ height │
│ ---            ┆ ---        ┆ ---    ┆ ---    │
│ str            ┆ date       ┆ f64    ┆ f64    │
╞════════════════╪════════════╪════════╪════════╡
│ Alice Archer   ┆ 1997-01-10 ┆ 57.9   ┆ 1.56   │
│ Ben Brown      ┆ 1985-02-15 ┆ 72.5   ┆ 1.77   │
│ Chloe Cooper   ┆ 1983-03-22 ┆ 53.6   ┆ 1.65   │
│ Daniel Donovan ┆ 1981-04-30 ┆ 83.1   ┆ 1.75   │
└────────────────┴────────────┴────────┴────────┘
```

:::tip 示例
接着上面的示例，现在我们将数据写入一个名为`output.csv`的`csv`文件中。然后，我们再使用`read_csv`进行读取，最后打印结果。
:::

```python title="Pyhton"
path = "output.csv"
df.write_csv(path)
df_csv = pl.read_csv(path, try_parse_dates=True)
print(df_csv)
```

> - try_parse_dates参数表示在读取文件内容时，是否解析日期类型。


```bash
shape: (4, 4)
┌────────────────┬────────────┬────────┬────────┐
│ name           ┆ birthdate  ┆ weight ┆ height │
│ ---            ┆ ---        ┆ ---    ┆ ---    │
│ str            ┆ date       ┆ f64    ┆ f64    │
╞════════════════╪════════════╪════════╪════════╡
│ Alice Archer   ┆ 1997-01-10 ┆ 57.9   ┆ 1.56   │
│ Ben Brown      ┆ 1985-02-15 ┆ 72.5   ┆ 1.77   │
│ Chloe Cooper   ┆ 1983-03-22 ┆ 53.6   ┆ 1.65   │
│ Daniel Donovan ┆ 1981-04-30 ┆ 83.1   ┆ 1.75   │
└────────────────┴────────────┴────────┴────────┘
```
有关 CSV 文件格式和其他数据格式的更多示例，请参阅[demodemo](/guide/index.md)。



## 表达式与上下文
表达式是 Polars 的主要优势之一，因为它们提供了一种模块化且灵活的方式来表达数据转换。

以下是 Polars 表达式的一个例子：
```python title="Pyhton"
pl.col("weight") / (pl.col("height") ** 2)
```
上面表达式的意义很简单，取名为`weight`的列，并将其值除以`height`列值的平方，从而计算出一个人的BMI。请注意，上面的代码表达的是一个计算逻辑，但该逻辑只有在Polars上下文中，表达式才能转化为包含结果的序列。就好比Pyhton代码能在任何文本里面写，但是只能在有Pyhton环境里面运行。

下面，我们将展示不同上下文中 Polars 表达式的示例：
- select
- with_columns
- filter
- group_by

有关表达式和上下文的更详细探讨，请参阅相应的[demodemo](/guide/index.md)。

### select
上下文select允许您从DataFrame中选择和操作列。在最简单的情况下，您提供的每个表达式将映射到结果DataFrame中的一列：

```python title="Python"
df = pl.DataFrame(
    {
        "name": ["Alice Archer", "Ben Brown", "Chloe Cooper", "Daniel Donovan"],
        "birthdate": [
            dt.date(1997, 1, 10),
            dt.date(1985, 2, 15),
            dt.date(1983, 3, 22),
            dt.date(1981, 4, 30),
        ],
        "weight": [57.9, 72.5, 53.6, 83.1],  # (kg)
        "height": [1.56, 1.77, 1.65, 1.75],  # (m)
    }
)

result = df.select(
    pl.col("name"),
    pl.col("birthdate").dt.year().alias("birth_year"),
    (pl.col("weight") / (pl.col("height") ** 2)).alias("bmi"),
)
print(result)
```

```bash
shape: (4, 3)
┌────────────────┬────────────┬───────────┐
│ name           ┆ birth_year ┆ bmi       │
│ ---            ┆ ---        ┆ ---       │
│ str            ┆ i32        ┆ f64       │
╞════════════════╪════════════╪═══════════╡
│ Alice Archer   ┆ 1997       ┆ 23.791913 │
│ Ben Brown      ┆ 1985       ┆ 23.141498 │
│ Chloe Cooper   ┆ 1983       ┆ 19.687787 │
│ Daniel Donovan ┆ 1981       ┆ 27.134694 │
└────────────────┴────────────┴───────────┘
```

Polars 还支持一项名为“表达式扩展”的功能，即一个表达式可以作为多个表达式的简写。在下面的示例中，我们使用表达式扩展通过单个表达式来操作“体重”和“身高”列。使用表达式扩展时，您可以使用`.name.prefix`和`.name.suffix`为原始列的名称添加前缀和后缀来作为新列名：
```python title="Python"
result = df.select(
    pl.col("name"),
    (pl.col("weight", "height") * 0.95).round(2).name.prefix("5%"),
    (pl.col("weight", "height") * 0.95).round(2).name.suffix("-5%"),
)
print(result)
```
```bash
shape: (4, 5)
┌────────────────┬──────────┬──────────┬───────────┬───────────┐
│ name           ┆ 5%weight ┆ 5%height ┆ weight-5% ┆ height-5% │
│ ---            ┆ ---      ┆ ---      ┆ ---       ┆ ---       │
│ str            ┆ f64      ┆ f64      ┆ f64       ┆ f64       │
╞════════════════╪══════════╪══════════╪═══════════╪═══════════╡
│ Alice Archer   ┆ 55.0     ┆ 1.48     ┆ 55.0      ┆ 1.48      │
│ Ben Brown      ┆ 68.88    ┆ 1.68     ┆ 68.88     ┆ 1.68      │
│ Chloe Cooper   ┆ 50.92    ┆ 1.57     ┆ 50.92     ┆ 1.57      │
│ Daniel Donovan ┆ 78.94    ┆ 1.66     ┆ 78.94     ┆ 1.66      │
└────────────────┴──────────┴──────────┴───────────┴───────────┘
```


### with_columns

with_columns与select相似，with_columns用来向DataFrame中添加列，生成的DataFrame包含原始DataFrame的列以及引入的新列。with_columns就是用来新增列的，而新增列的数据是根据表达式而来。

```python title="Python" {16}
df = pl.DataFrame(
    {
        "name": ["Alice Archer", "Ben Brown", "Chloe Cooper", "Daniel Donovan"],
        "birthdate": [
            dt.date(1997, 1, 10),
            dt.date(1985, 2, 15),
            dt.date(1983, 3, 22),
            dt.date(1981, 4, 30),
        ],
        "weight": [57.9, 72.5, 53.6, 83.1],  # (kg)
        "height": [1.56, 1.77, 1.65, 1.75],  # (m)
    }
)
result = df.with_columns(
    pl.col("birthdate").dt.year().alias("birth_year"),
    (pl.col("weight") / (pl.col("height") ** 2)).alias("bmi"),
)

print(result)
```

```bash
shape: (4, 6)
┌────────────────┬────────────┬────────┬────────┬────────────┬───────────┐
│ name           ┆ birthdate  ┆ weight ┆ height ┆ birth_year ┆ bmi       │
│ ---            ┆ ---        ┆ ---    ┆ ---    ┆ ---        ┆ ---       │
│ str            ┆ date       ┆ f64    ┆ f64    ┆ i32        ┆ f64       │
╞════════════════╪════════════╪════════╪════════╪════════════╪═══════════╡
│ Alice Archer   ┆ 1997-01-10 ┆ 57.9   ┆ 1.56   ┆ 1997       ┆ 23.791913 │
│ Ben Brown      ┆ 1985-02-15 ┆ 72.5   ┆ 1.77   ┆ 1985       ┆ 23.141498 │
│ Chloe Cooper   ┆ 1983-03-22 ┆ 53.6   ┆ 1.65   ┆ 1983       ┆ 19.687787 │
│ Daniel Donovan ┆ 1981-04-30 ┆ 83.1   ┆ 1.75   ┆ 1981       ┆ 27.134694 │
└────────────────┴────────────┴────────┴────────┴────────────┴───────────┘
```

:::tip 列名命名
新增列的列名，也可以通过命名表达式来实现。

```python title="Python"
result = df.with_columns(
    birth_year=pl.col("birthdate").dt.year(),
    bmi=pl.col("weight") / (pl.col("height") ** 2),
)
```
:::


### filter
用于对DataFrame中的数据进行过滤，满足条件的数据将会被过滤出来成为一个新的DataFrame。

```python title="Python"
result = df.filter(pl.col("birthdate").dt.year() < 1990)
print(result)
```
```bash
shape: (3, 4)
┌────────────────┬────────────┬────────┬────────┐
│ name           ┆ birthdate  ┆ weight ┆ height │
│ ---            ┆ ---        ┆ ---    ┆ ---    │
│ str            ┆ date       ┆ f64    ┆ f64    │
╞════════════════╪════════════╪════════╪════════╡
│ Ben Brown      ┆ 1985-02-15 ┆ 72.5   ┆ 1.77   │
│ Chloe Cooper   ┆ 1983-03-22 ┆ 53.6   ┆ 1.65   │
│ Daniel Donovan ┆ 1981-04-30 ┆ 83.1   ┆ 1.75   │
└────────────────┴────────────┴────────┴────────┘
```
多条件过滤：
```python title="Python"
result = df.filter(
    (pl.col("birthdate").is_between(dt.date(1982, 12, 31), dt.date(1996, 1, 1))) & (pl.col("height") > 1.7)
)
print(result)
```

```bash
shape: (1, 4)
┌───────────┬────────────┬────────┬────────┐
│ name      ┆ birthdate  ┆ weight ┆ height │
│ ---       ┆ ---        ┆ ---    ┆ ---    │
│ str       ┆ date       ┆ f64    ┆ f64    │
╞═══════════╪════════════╪════════╪════════╡
│ Ben Brown ┆ 1985-02-15 ┆ 72.5   ┆ 1.77   │
└───────────┴────────────┴────────┴────────┘
```

还可以提供多个谓词表达式实现多条件过滤：
```python title="Python"
result = df.filter(
    pl.col("birthdate").is_between(dt.date(1982, 12, 31), dt.date(1996, 1, 1)),
    pl.col("height") > 1.7,
)
print(result)
```

### group_by

group_by可用于将 DataFrame 中单列或多列中存在相同值的行组合在一起。以下示例统计了每个十年出生的人数：
```python title="Python"
result = df.group_by(
    (pl.col("birthdate").dt.year() // 10 * 10).alias("decade"),
    maintain_order=True,
).len()
print(result)
```
```bash
shape: (2, 2)
┌────────┬─────┐
│ decade ┆ len │
│ ---    ┆ --- │
│ i32    ┆ u32 │
╞════════╪═════╡
│ 1990   ┆ 1   │
│ 1980   ┆ 3   │
└────────┴─────┘
```
::: info maintain_order参数
参数maintain_order强制 Polars 按照原始DataFrame中出现的顺序呈现结果组。这会减慢分组操作的速度。
:::

使用group_by之后，我们可以用agg来聚合分组后的结果组：
```python title="Python"
result = df.group_by(
    (pl.col("birthdate").dt.year() // 10 * 10).alias("decade"),
    maintain_order=True,
).agg(
    pl.len().alias("sample_size"),
    pl.col("weight").mean().round(2).alias("avg_weight"),
    pl.col("height").max().alias("tallest"),
)
print(result)
```
```bash
shape: (2, 4)
┌────────┬─────────────┬────────────┬─────────┐
│ decade ┆ sample_size ┆ avg_weight ┆ tallest │
│ ---    ┆ ---         ┆ ---        ┆ ---     │
│ i32    ┆ u32         ┆ f64        ┆ f64     │
╞════════╪═════════════╪════════════╪═════════╡
│ 1990   ┆ 1           ┆ 57.9       ┆ 1.56    │
│ 1980   ┆ 3           ┆ 69.73      ┆ 1.77    │
└────────┴─────────────┴────────────┴─────────┘
```


### 联合示例
```python title="Python"
result = (
    df.with_columns(
        (pl.col("birthdate").dt.year() // 10 * 10).alias("decade"),
        pl.col("name").str.split(by=" ").list.first(),
    )
    .select(
        pl.all().exclude("birthdate"),
    )
    .group_by(
        pl.col("decade"),
        maintain_order=True,
    )
    .agg(
        pl.col("name"),
        pl.col("weight", "height").mean().round(2).name.prefix("avg_"),
    )
)
print(result)
```
```bash
shape: (2, 4)
┌────────┬────────────────────────────┬────────────┬────────────┐
│ decade ┆ name                       ┆ avg_weight ┆ avg_height │
│ ---    ┆ ---                        ┆ ---        ┆ ---        │
│ i32    ┆ list[str]                  ┆ f64        ┆ f64        │
╞════════╪════════════════════════════╪════════════╪════════════╡
│ 1990   ┆ ["Alice"]                  ┆ 57.9       ┆ 1.56       │
│ 1980   ┆ ["Ben", "Chloe", "Daniel"] ┆ 69.73      ┆ 1.72       │
└────────┴────────────────────────────┴────────────┴────────────┘
```

## 合并DataFrame
Polars 提供了许多工具来合并两个 DataFrame。在本节中，我们将展示一个连接 (join) 和一个串联 (concatenation) 的示例。

### 关联DataFrame

Polars 提供了许多不同的连接算法。下面的示例展示了如何使用左外连接来组合两个 DataFrame，当某个列可以作为唯一标识符来建立 DataFrame 中行与行之间的对应关系时：
```python title="Python"
df = pl.DataFrame(
    {
        "name": ["Alice Archer", "Ben Brown", "Chloe Cooper", "Daniel Donovan"],
        "birthdate": [
            dt.date(1997, 1, 10),
            dt.date(1985, 2, 15),
            dt.date(1983, 3, 22),
            dt.date(1981, 4, 30),
        ],
        "weight": [57.9, 72.5, 53.6, 83.1],  # (kg)
        "height": [1.56, 1.77, 1.65, 1.75],  # (m)
    }
)
df2 = pl.DataFrame(
    {
        "name": ["Ben Brown", "Daniel Donovan",  "Chloe Cooper", "Eve Davis"],
        "parent": [True, False, False, True],
        "siblings": [1, 2, 3, 4],
    }
)

print(df.join(df2, on="name", how="left"))
```
```bash
shape: (4, 6)
┌────────────────┬────────────┬────────┬────────┬────────┬──────────┐
│ name           ┆ birthdate  ┆ weight ┆ height ┆ parent ┆ siblings │
│ ---            ┆ ---        ┆ ---    ┆ ---    ┆ ---    ┆ ---      │
│ str            ┆ date       ┆ f64    ┆ f64    ┆ bool   ┆ i64      │
╞════════════════╪════════════╪════════╪════════╪════════╪══════════╡
│ Alice Archer   ┆ 1997-01-10 ┆ 57.9   ┆ 1.56   ┆ null   ┆ null     │
│ Ben Brown      ┆ 1985-02-15 ┆ 72.5   ┆ 1.77   ┆ true   ┆ 1        │
│ Chloe Cooper   ┆ 1983-03-22 ┆ 53.6   ┆ 1.65   ┆ false  ┆ 3        │
│ Daniel Donovan ┆ 1981-04-30 ┆ 83.1   ┆ 1.75   ┆ false  ┆ 2        │
└────────────────┴────────────┴────────┴────────┴────────┴──────────┘
```
Polars 提供了许多不同的连接方式，[详细可见demodemo]() 


### 拼接DataFrame
拼接DataFrame会创建一个更高或更宽的DataFrame，具体取决于所使用的方法。假设我们有第二个数据框，其中包含来自其他人的数据，我们可以使用垂直连接来创建一个更高的DataFrame：

```python title="Python"
df = pl.DataFrame(
    {
        "name": ["Alice Archer", "Ben Brown", "Chloe Cooper", "Daniel Donovan"],
        "birthdate": [
            dt.date(1997, 1, 10),
            dt.date(1985, 2, 15),
            dt.date(1983, 3, 22),
            dt.date(1981, 4, 30),
        ],
        "weight": [57.9, 72.5, 53.6, 83.1],  # (kg)
        "height": [1.56, 1.77, 1.65, 1.75],  # (m)
    }
)
df3 = pl.DataFrame(
    {
        "name": ["Ethan Edwards", "Fiona Foster", "Grace Gibson", "Henry Harris"],
        "birthdate": [
            dt.date(1977, 5, 10),
            dt.date(1975, 6, 23),
            dt.date(1973, 7, 22),
            dt.date(1971, 8, 3),
        ],
        "weight": [67.9, 72.5, 57.6, 93.1],  # (kg)
        "height": [1.76, 1.6, 1.66, 1.8],  # (m)
    }
)

print(pl.concat([df, df3], how="vertical"))
```
```bash
shape: (8, 4)
┌────────────────┬────────────┬────────┬────────┐
│ name           ┆ birthdate  ┆ weight ┆ height │
│ ---            ┆ ---        ┆ ---    ┆ ---    │
│ str            ┆ date       ┆ f64    ┆ f64    │
╞════════════════╪════════════╪════════╪════════╡
│ Alice Archer   ┆ 1997-01-10 ┆ 57.9   ┆ 1.56   │
│ Ben Brown      ┆ 1985-02-15 ┆ 72.5   ┆ 1.77   │
│ Chloe Cooper   ┆ 1983-03-22 ┆ 53.6   ┆ 1.65   │
│ Daniel Donovan ┆ 1981-04-30 ┆ 83.1   ┆ 1.75   │
│ Ethan Edwards  ┆ 1977-05-10 ┆ 67.9   ┆ 1.76   │
│ Fiona Foster   ┆ 1975-06-23 ┆ 72.5   ┆ 1.6    │
│ Grace Gibson   ┆ 1973-07-22 ┆ 57.6   ┆ 1.66   │
│ Henry Harris   ┆ 1971-08-03 ┆ 93.1   ┆ 1.8    │
└────────────────┴────────────┴────────┴────────┘
```
Polars 提供垂直和水平连接以及对角线连接功能。[详细可见demodemo]() 



## Polars与Pandas互相转换
```python title="Python"
import polars as pl
import pandas as pd

pddf = pd.DataFrame()
pldf = pl.DataFrame(pddf) # Pandas转为polars
newpddf = pldf.to_pandas() # polars转为Pandas
```


