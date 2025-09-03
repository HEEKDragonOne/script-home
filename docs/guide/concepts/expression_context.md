## 表达式和上下文

Polars 开发了自己的领域特定语言(DSL)来转换数据. 该语言非常易于使用, 并允许进行复杂的查询, 同时保持人类可读性.
表达式和上下文（将在此处介绍）对于实现这种可读性非常重要, 同时还允许`Polars`查询引擎优化您的查询以使其尽可能快地运行。

## 表达式

在Polars中,表达式是数据转换的惰性表示形式. 表达式是模块化且灵活的, 这意味着可以将它们用作构建块来构建更复杂的表达式。
以下是 Polars 表达式的基本示例:

```python title="Python"
import polars as pl

pl.col("weight") / (pl.col("height") ** 2)
```
此表达式采用名为`weight`的列，并将其值除以`height`列中值的平方，从而计算出一个人的 BMI。
上面的代码表达了一种抽象的计算，我们可以将其保存在变量中进一步操作，或者只是打印：
```python title="Python"
bmi_expr = pl.col("weight") / (pl.col("height") ** 2)
print(bmi_expr)
```
```bash
[(col("weight")) / (col("height").pow([dyn int: 2]))]
```
因为表达式是惰性的，所以还没有发生任何计算。这就是我们需要上下文的原因。


## 上下文
Polars 表达式需要一个上下文来执行并产生结果。根据所使用的上下文，相同的 Polars 表达式可能会产生不同的结果。 常见的上下文有:
1. `select`
2. `with_columns`
3. `filter`
4. `group_by`

### 准备数据

```python title="Python"
from datetime import date

df = pl.DataFrame(
    {
        "name": ["Alice Archer", "Ben Brown", "Chloe Cooper", "Daniel Donovan"],
        "birthdate": [
            date(1997, 1, 10),
            date(1985, 2, 15),
            date(1983, 3, 22),
            date(1981, 4, 30),
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

### select
`select`上下文将表达式应用于列,可能会生成新的列，这些列可以是聚合后的结果、其他列组合的结果或常量字符串：

```python title="Python"
bmi_expr = pl.col("weight") / (pl.col("height") ** 2)

result = df.select(
    bmi=bmi_expr,
    avg_bmi=bmi_expr.mean(),
    ideal_max_bmi=25,
)
print(result)
``````
```bash
shape: (4, 3)
┌───────────┬───────────┬───────────────┐
│ bmi       ┆ avg_bmi   ┆ ideal_max_bmi │
│ ---       ┆ ---       ┆ ---           │
│ f64       ┆ f64       ┆ i32           │
╞═══════════╪═══════════╪═══════════════╡
│ 23.791913 ┆ 23.438973 ┆ 25            │
│ 23.141498 ┆ 23.438973 ┆ 25            │
│ 19.687787 ┆ 23.438973 ┆ 25            │
│ 27.134694 ┆ 23.438973 ┆ 25            │
└───────────┴───────────┴───────────────┘
```
`select`上下文中的表达式必须生成长度相同的序列，或者必须生成一个标量。标量将被广播以匹配剩余序列的长度。文字（例如上面使用的数字）也会被广播，广播也可以在表达式中发生。(所谓广播，简单理解就是会和该列的每一个值都进行操作)

```python title="Python"
result = df.select(deviation=(bmi_expr - bmi_expr.mean()) / bmi_expr.std())
print(result)
```
```text
shape: (4, 1)
┌───────────┐
│ deviation │
│ ---       │
│ f64       │
╞═══════════╡
│ 0.115645  │
│ -0.097471 │
│ -1.22912  │
│ 1.210946  │
└───────────┘
```


#### 选择单列

- 直接使用字符串: `df.select("name")`
- 使用列表: `df.select(["name"])`
- 使用元组: `df.select(("name",))`
- 使用`pl.col()`: `df.select(pl.col("name"))`

它们实现的效果一样，如下所示：

```text
shape: (4, 1)
┌────────────────┐
│ name           │
│ ---            │
│ str            │
╞════════════════╡
│ Alice Archer   │
│ Ben Brown      │
│ Chloe Cooper   │
│ Daniel Donovan │
└────────────────┘
```

#### 选择多列
- 使用列表: `df.select(["name","weight"])`
- 使用元组: `df.select(("name","weight"))`
- 使用`pl.col(str)`: `df.select([pl.col("name"),pl.col("weight")])`
- 使用`pl.col(str)`: `df.select(pl.col("name"),pl.col("weight"))`
- 使用`pl.col(tuple)`: `df.select(pl.col("name","weight"))`
- 使用`pl.col(list)`: `df.select(pl.col(["name","weight"]))`

```text
shape: (4, 2)
┌────────────────┬────────┐
│ name           ┆ weight │
│ ---            ┆ ---    │
│ str            ┆ f64    │
╞════════════════╪════════╡
│ Alice Archer   ┆ 57.9   │
│ Ben Brown      ┆ 72.5   │
│ Chloe Cooper   ┆ 53.6   │
│ Daniel Donovan ┆ 83.1   │
└────────────────┴────────┘
```

#### 重命名
::: warning
下面示例一、二中新列的名称new_name不能添加双引号进行包裹, 这是语法要求。
:::

- `df.select(new_name=pl.col("name"))`
- `df.select(new_name="name")`
- `df.select(pl.col("name").alias("new_name"))`
```text
shape: (4, 1)
┌────────────────┐
│ new_name       │
│ ---            │
│ str            │
╞════════════════╡
│ Alice Archer   │
│ Ben Brown      │
│ Chloe Cooper   │
│ Daniel Donovan │
└────────────────┘
```


### with_columns
用来新增一或多列。

::: tip 

- with_columns与select非常相似, 主要区别在于: with_columns用来产生列；select用来选择列。
- with_columns产生的新DataFrame包含原列以及新增列；select产生的新DataFrame只会包含选择的列。
- 如果新增的列和原来的列重名, 则会`覆盖`原来的列。

:::


#### 新增列

```python title="Python"
result = df.with_columns(
    bmi=bmi_expr,
    avg_bmi=bmi_expr.mean(),
    ideal_max_bmi=25,
)
print(result)
```

```text
shape: (4, 7)
┌────────────────┬────────────┬────────┬────────┬───────────┬───────────┬───────────────┐
│ name           ┆ birthdate  ┆ weight ┆ height ┆ bmi       ┆ avg_bmi   ┆ ideal_max_bmi │
│ ---            ┆ ---        ┆ ---    ┆ ---    ┆ ---       ┆ ---       ┆ ---           │
│ str            ┆ date       ┆ f64    ┆ f64    ┆ f64       ┆ f64       ┆ i32           │
╞════════════════╪════════════╪════════╪════════╪═══════════╪═══════════╪═══════════════╡
│ Alice Archer   ┆ 1997-01-10 ┆ 57.9   ┆ 1.56   ┆ 23.791913 ┆ 23.438973 ┆ 25            │
│ Ben Brown      ┆ 1985-02-15 ┆ 72.5   ┆ 1.77   ┆ 23.141498 ┆ 23.438973 ┆ 25            │
│ Chloe Cooper   ┆ 1983-03-22 ┆ 53.6   ┆ 1.65   ┆ 19.687787 ┆ 23.438973 ┆ 25            │
│ Daniel Donovan ┆ 1981-04-30 ┆ 83.1   ┆ 1.75   ┆ 27.134694 ┆ 23.438973 ┆ 25            │
└────────────────┴────────────┴────────┴────────┴───────────┴───────────┴───────────────┘
```


#### 列名定义-alias

```python title="Python"
df = df.with_columns(
    pl.col("name").alias("full_name")
)
print(df)
```
```text
shape: (4, 5)
┌────────────────┬────────────┬────────┬────────┬────────────────┐
│ name           ┆ birthdate  ┆ weight ┆ height ┆ full_name      │
│ ---            ┆ ---        ┆ ---    ┆ ---    ┆ ---            │
│ str            ┆ date       ┆ f64    ┆ f64    ┆ str            │
╞════════════════╪════════════╪════════╪════════╪════════════════╡
│ Alice Archer   ┆ 1997-01-10 ┆ 57.9   ┆ 1.56   ┆ Alice Archer   │
│ Ben Brown      ┆ 1985-02-15 ┆ 72.5   ┆ 1.77   ┆ Ben Brown      │
│ Chloe Cooper   ┆ 1983-03-22 ┆ 53.6   ┆ 1.65   ┆ Chloe Cooper   │
│ Daniel Donovan ┆ 1981-04-30 ┆ 83.1   ┆ 1.75   ┆ Daniel Donovan │
└────────────────┴────────────┴────────┴────────┴────────────────┘
```

#### 使用标量

```python  title="Python"
df = df.with_columns(
    pl.lit("1").alias("type_str")
)
df = df.with_columns(
    pl.lit(42).alias("type_num")
)

df = df.with_columns(
    pl.lit("1",dtype=pl.UInt8).alias("type_str_int")
)

print(df)
```
```text
shape: (4, 7)
┌────────────────┬────────────┬────────┬────────┬──────────┬──────────┬──────────────┐
│ name           ┆ birthdate  ┆ weight ┆ height ┆ type_str ┆ type_num ┆ type_str_int │
│ ---            ┆ ---        ┆ ---    ┆ ---    ┆ ---      ┆ ---      ┆ ---          │
│ str            ┆ date       ┆ f64    ┆ f64    ┆ str      ┆ i32      ┆ u8           │
╞════════════════╪════════════╪════════╪════════╪══════════╪══════════╪══════════════╡
│ Alice Archer   ┆ 1997-01-10 ┆ 57.9   ┆ 1.56   ┆ 1        ┆ 42       ┆ 1            │
│ Ben Brown      ┆ 1985-02-15 ┆ 72.5   ┆ 1.77   ┆ 1        ┆ 42       ┆ 1            │
│ Chloe Cooper   ┆ 1983-03-22 ┆ 53.6   ┆ 1.65   ┆ 1        ┆ 42       ┆ 1            │
│ Daniel Donovan ┆ 1981-04-30 ┆ 83.1   ┆ 1.75   ┆ 1        ┆ 42       ┆ 1            │
└────────────────┴────────────┴────────┴────────┴──────────┴──────────┴──────────────┘
```





### filter
上下文filter根据一个或多个计算结果为布尔数据类型的表达式来过滤数据框的行。

```python title="Python"
result = df.filter(
    pl.col("birthdate").is_between(date(1982, 12, 31), date(1996, 1, 1)),
    pl.col("height") > 1.7,
)
print(result)
```

```text
shape: (1, 4)
┌───────────┬────────────┬────────┬────────┐
│ name      ┆ birthdate  ┆ weight ┆ height │
│ ---       ┆ ---        ┆ ---    ┆ ---    │
│ str       ┆ date       ┆ f64    ┆ f64    │
╞═══════════╪════════════╪════════╪════════╡
│ Ben Brown ┆ 1985-02-15 ┆ 72.5   ┆ 1.77   │
└───────────┴────────────┴────────┴────────┘
```
::: tip 等价替换
```python title="Python"
import datetime as dt

result = df.filter(
    (pl.col("birthdate").is_between(dt.date(1982, 12, 31), dt.date(1996, 1, 1))) & (pl.col("height") > 1.7)
)
```
:::


### 分组(group_by)和聚合(agg)

在上下文group_by中，行根据分组表达式的唯一值进行分组。然后通过agg函数可以操作分组后的结果。

```python title="Python"
result = df.group_by(
    (pl.col("birthdate").dt.year() // 10 * 10).alias("decade"),
).agg(pl.col("name"))
print(result)
```
```text
shape: (2, 2)
┌────────┬─────────────────────────────────┐
│ decade ┆ name                            │
│ ---    ┆ ---                             │
│ i32    ┆ list[str]                       │
╞════════╪═════════════════════════════════╡
│ 1990   ┆ ["Alice Archer"]                │
│ 1980   ┆ ["Ben Brown", "Chloe Cooper", … │
└────────┴─────────────────────────────────┘
```
在上面的示例中，统计了每十年出生的人名。

还可以指定任意数量的分组表达式，group_by会根据指定表达式中的不同值对行进行分组。根据出生年代和身高是否低于1.7米进行分组：
```python title="Python"
result = df.group_by(
    (pl.col("birthdate").dt.year() // 10 * 10).alias("decade"),
    (pl.col("height") < 1.7).alias("short?"),
).agg(pl.col("name"))
print(result)
```
```text
shape: (3, 3)
┌────────┬────────┬─────────────────────────────────┐
│ decade ┆ short? ┆ name                            │
│ ---    ┆ ---    ┆ ---                             │
│ i32    ┆ bool   ┆ list[str]                       │
╞════════╪════════╪═════════════════════════════════╡
│ 1990   ┆ true   ┆ ["Alice Archer"]                │
│ 1980   ┆ false  ┆ ["Ben Brown", "Daniel Donovan"… │
│ 1980   ┆ true   ┆ ["Chloe Cooper"]                │
└────────┴────────┴─────────────────────────────────┘
```
分组聚合后生成的DataFrame，在左侧是每个分组表达式各占一列，接着是聚合表达式的结果。可以根据需要指定任意数量的聚合表达式：
```python title="Python"
result = df.group_by(
    (pl.col("birthdate").dt.year() // 10 * 10).alias("decade"),
    (pl.col("height") < 1.7).alias("short?"),
).agg(
    pl.len(),
    pl.col("height").max().alias("tallest"),
    pl.col("weight").mean().alias("avg_weight"),
    pl.col("height").mean().alias("avg_height"),
)
print(result)
```
```text
shape: (3, 6)
┌────────┬────────┬─────┬─────────┬────────────┬────────────┐
│ decade ┆ short? ┆ len ┆ tallest ┆ avg_weight ┆ avg_height │
│ ---    ┆ ---    ┆ --- ┆ ---     ┆ ---        ┆ ---        │
│ i32    ┆ bool   ┆ u32 ┆ f64     ┆ f64        ┆ f64        │
╞════════╪════════╪═════╪═════════╪════════════╪════════════╡
│ 1980   ┆ false  ┆ 2   ┆ 1.77    ┆ 77.8       ┆ 1.76       │
│ 1990   ┆ true   ┆ 1   ┆ 1.56    ┆ 57.9       ┆ 1.56       │
│ 1980   ┆ true   ┆ 1   ┆ 1.65    ┆ 53.6       ┆ 1.65       │
└────────┴────────┴─────┴─────────┴────────────┴────────────┘
```

## 表达式扩展

> 上面最后一个例子包含两个分组表达式和四个聚合表达式。仔细观察就会发现，最后两个聚合表达式涉及到了两个不同的列：“weight”和“height”。但它们的计算处理逻辑是相同，是否可以将其合成一个或者简写？

Polars表达式支持一项称为表达式扩展的功能，表达式扩展就像是将相同转换应用于多个列时的简写符号。正如上面示例，表达式：
```python title="Python"
[
    pl.col("weight").mean().alias("avg_weight"),
    pl.col("height").mean().alias("avg_height"),
]
```
可以简写为：
```python title="Python"
pl.col("weight", "height").mean().name.prefix("avg_")
```
::: details 最后的示例可以简写为
```python title="Python"
result = df.group_by(
    (pl.col("birthdate").dt.year() // 10 * 10).alias("decade"),
    (pl.col("height") < 1.7).alias("short?"),
).agg(
    pl.len(),
    pl.col("height").max().alias("tallest"),
    pl.col("weight", "height").mean().name.prefix("avg_"),
)
print(result)
```
:::

该表达式会展开为两个独立的表达式，Polar 可以并行执行它们。但在有些情况下，有可能无法预先知道一个表达式会展开成多少个独立的表达式，那么可以通过数据类型进行扩展，如下例子：
```python title="Python"
(pl.col(pl.Float64) * 1.1).name.suffix("*1.1")
```
此表达式将把所有数据类型为`Float64`的列乘以1.1。具体示例：
```python title="Python"
expr = (pl.col(pl.Float64) * 1.1).name.suffix("*1.1")
result = df.select(expr)
print(result)
```
```text
shape: (4, 2)
┌────────────┬────────────┐
│ weight*1.1 ┆ height*1.1 │
│ ---        ┆ ---        │
│ f64        ┆ f64        │
╞════════════╪════════════╡
│ 63.69      ┆ 1.716      │
│ 79.75      ┆ 1.947      │
│ 58.96      ┆ 1.815      │
│ 91.41      ┆ 1.925      │
└────────────┴────────────┘
```
如果DataFrame中不存在`Float64`类型的数据，那么结果将会是一个空的：
```text
shape: (0, 0)
┌┐
╞╡
└┘
```


