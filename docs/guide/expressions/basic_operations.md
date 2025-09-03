## 基本操作

这一节展示如何在`DataFrame`列上做一些基本操作, 比如基本的算数运算, 执行比较和其他通用操作

## 数据准备


``` python title="Python"
import polars as pl
import numpy as np

np.random.seed(42)  # For reproducibility.

df = pl.DataFrame(
    {
        "nrs": [1, 2, 3, None, 5],
        "names": ["foo", "ham", "spam", "egg", "spam"],
        "random": np.random.rand(5),
        "groups": ["A", "A", "B", "A", "B"],
    }
)
print(df)
```

```text
shape: (5, 4)
┌──────┬───────┬──────────┬────────┐
│ nrs  ┆ names ┆ random   ┆ groups │
│ ---  ┆ ---   ┆ ---      ┆ ---    │
│ i64  ┆ str   ┆ f64      ┆ str    │
╞══════╪═══════╪══════════╪════════╡
│ 1    ┆ foo   ┆ 0.37454  ┆ A      │
│ 2    ┆ ham   ┆ 0.950714 ┆ A      │
│ 3    ┆ spam  ┆ 0.731994 ┆ B      │
│ null ┆ egg   ┆ 0.598658 ┆ A      │
│ 5    ┆ spam  ┆ 0.156019 ┆ B      │
└──────┴───────┴──────────┴────────┘
```

## 基本运算

Polars支持相同长度的Series之间或Series和字面量之间的基本运算。当两者混合时, 字面量会被广播以匹配其所用Series的长度，也就是会将字面量和Series中的每个值都进行操作。如下示例：

  - `pl.col("nrs")+5` : 将nrs这一列中的每一个值都+5。
  - `pl.col("nrs)/pl.col("random")` : 将nrs这一列中的每一个值和random列中对应的值进行除法运算。

```python title="Python"
result = df.select(
    (pl.col("nrs") + 5).alias("nrs + 5"),
    (pl.col("nrs") - 5).alias("nrs - 5"),
    (pl.col("nrs") * pl.col("random")).alias("nrs * random"),
    (pl.col("nrs") / pl.col("random")).alias("nrs / random"),
    (pl.col("nrs") ** 2).alias("nrs ** 2"),
    (pl.col("nrs") % 3).alias("nrs % 3"),
)

print(result)
```

```text {10}
shape: (5, 6)
┌─────────┬─────────┬──────────────┬──────────────┬──────────┬─────────┐
│ nrs + 5 ┆ nrs - 5 ┆ nrs * random ┆ nrs / random ┆ nrs ** 2 ┆ nrs % 3 │
│ ---     ┆ ---     ┆ ---          ┆ ---          ┆ ---      ┆ ---     │
│ i64     ┆ i64     ┆ f64          ┆ f64          ┆ i64      ┆ i64     │
╞═════════╪═════════╪══════════════╪══════════════╪══════════╪═════════╡
│ 6       ┆ -4      ┆ 0.37454      ┆ 2.669941     ┆ 1        ┆ 1       │
│ 7       ┆ -3      ┆ 1.901429     ┆ 2.103681     ┆ 4        ┆ 2       │
│ 8       ┆ -2      ┆ 2.195982     ┆ 4.098395     ┆ 9        ┆ 0       │
│ null    ┆ null    ┆ null         ┆ null         ┆ null     ┆ null    │
│ 10      ┆ 0       ┆ 0.780093     ┆ 32.047453    ┆ 25       ┆ 2       │
└─────────┴─────────┴──────────────┴──────────────┴──────────┴─────────┘
```

:::tip
结果中高亮行， 当算术运算中将 `null`作为其操作数之一的时候， 结果为 `null`
:::

Polars 使用运算符重载，允许在表达式中使用语言的原生算术运算符。可以使用相应的命名函数，如下面的代码片段所示：

```python title="Python"
result = df.select(
    (pl.col("nrs") + 5).alias("nrs + 5"),
    (pl.col("nrs") - 5).alias("nrs - 5"),
    (pl.col("nrs") * pl.col("random")).alias("nrs * random"),
    (pl.col("nrs") / pl.col("random")).alias("nrs / random"),
    (pl.col("nrs") ** 2).alias("nrs ** 2"),
    (pl.col("nrs") % 3).alias("nrs % 3"),
)

# Python only:
result_named_operators = df.select(
    (pl.col("nrs").add(5)).alias("nrs + 5"),
    (pl.col("nrs").sub(5)).alias("nrs - 5"),
    (pl.col("nrs").mul(pl.col("random"))).alias("nrs * random"),
    (pl.col("nrs").truediv(pl.col("random"))).alias("nrs / random"),
    (pl.col("nrs").pow(2)).alias("nrs ** 2"),
    (pl.col("nrs").mod(3)).alias("nrs % 3"),
)

print(result.equals(result_named_operators))
```

```text
True
```


## 比较

:::tip 提示
与算数运算一样, Polars支持运算符重载或命名函数来进行比较
:::

使用运算符

```python title="Python"
result = df.select(
    (pl.col("nrs") > 1).alias("nrs > 1"),
    (pl.col("nrs") >= 3).alias("nrs >= 3"),
    (pl.col("random") < 0.2).alias("random < 0.2"),
    (pl.col("random") <= 0.5).alias("random <= 0.5"),
    (pl.col("nrs") != 1).alias("nrs != 1"),
    (pl.col("nrs") == 1).alias("nrs == 1"),
)
print(result)
```

```text
shape: (5, 6)
┌─────────┬──────────┬──────────────┬───────────────┬──────────┬──────────┐
│ nrs > 1 ┆ nrs >= 3 ┆ random < 0.2 ┆ random <= 0.5 ┆ nrs != 1 ┆ nrs == 1 │
│ ---     ┆ ---      ┆ ---          ┆ ---           ┆ ---      ┆ ---      │
│ bool    ┆ bool     ┆ bool         ┆ bool          ┆ bool     ┆ bool     │
╞═════════╪══════════╪══════════════╪═══════════════╪══════════╪══════════╡
│ false   ┆ false    ┆ false        ┆ true          ┆ false    ┆ true     │
│ true    ┆ false    ┆ false        ┆ false         ┆ true     ┆ false    │
│ true    ┆ true     ┆ false        ┆ false         ┆ true     ┆ false    │
│ null    ┆ null     ┆ false        ┆ false         ┆ null     ┆ null     │
│ true    ┆ true     ┆ true         ┆ true          ┆ true     ┆ false    │
└─────────┴──────────┴──────────────┴───────────────┴──────────┴──────────┘
```

使用命名函数

```python
result = df.select(
    (pl.col("nrs").gt(1).alias("nrs > 1")), # greater than
    (pl.col("nrs").ge(3)).alias("nrs >= 3"), # greater than or equal
    (pl.col("random").lt(0.2)).alias("random < 0.2"),
    (pl.col("random").le(0.5)).alias("random <= 0.5"),
    (pl.col("nrs").ne(1)).alias("nrs != 1"),
    (pl.col("nrs").eq(1)).alias("nrs == 1"),
)
print(result)
```

```text
shape: (5, 6)
┌─────────┬──────────┬──────────────┬───────────────┬──────────┬──────────┐
│ nrs > 1 ┆ nrs >= 3 ┆ random < 0.2 ┆ random <= 0.5 ┆ nrs != 1 ┆ nrs == 1 │
│ ---     ┆ ---      ┆ ---          ┆ ---           ┆ ---      ┆ ---      │
│ bool    ┆ bool     ┆ bool         ┆ bool          ┆ bool     ┆ bool     │
╞═════════╪══════════╪══════════════╪═══════════════╪══════════╪══════════╡
│ false   ┆ false    ┆ false        ┆ true          ┆ false    ┆ true     │
│ true    ┆ false    ┆ false        ┆ false         ┆ true     ┆ false    │
│ true    ┆ true     ┆ false        ┆ false         ┆ true     ┆ false    │
│ null    ┆ null     ┆ false        ┆ false         ┆ null     ┆ null     │
│ true    ┆ true     ┆ true         ┆ true          ┆ true     ┆ false    │
└─────────┴──────────┴──────────────┴───────────────┴──────────┴──────────┘
```

## 布尔运算和按位运算

[回顾下数据](#数据准备)

### 布尔运算

:::tip

- 运算符: `&`, `|`, `~`
- 同名函数: `and_`, `or_`, `not_`

:::

使用运算符

```python
result = df.select(
    ((~pl.col("nrs").is_null()) & (pl.col("groups") == "A"))
    .alias("number not null and group A"),

    ((pl.col("random") < 0.5) | (pl.col("groups") == "B"))
    .alias("random < 0.5 or group B"),
)
print(result)
```

```text
shape: (5, 2)
┌─────────────────────────────┬─────────────────────────┐
│ number not null and group A ┆ random < 0.5 or group B │
│ ---                         ┆ ---                     │
│ bool                        ┆ bool                    │
╞═════════════════════════════╪═════════════════════════╡
│ true                        ┆ true                    │
│ true                        ┆ false                   │
│ false                       ┆ true                    │
│ false                       ┆ false                   │
│ false                       ┆ true                    │
└─────────────────────────────┴─────────────────────────┘
```

使用命名函数, 由于`and`,`or`,`not`是Python的关键字, 所以使用`and_`,`or_`,`not_`

```python
result2 = df.select(
    (pl.col("nrs").is_null().not_().and_(pl.col("groups") == "A"))
    .alias("number not null and group A"),
    ((pl.col("random") < 0.5).or_(pl.col("groups") == "B"))
    .alias("random < 0.5 or group B"),
)
# 比较两个DataFrame是否相同
print(result2.equals(result))
```

```text
True
```

### 位运算

```python
result = df.select(
    pl.col("nrs"),
    (pl.col("nrs") & 6).alias("nrs & 6"),   # 与运算
    (pl.col("nrs") | 6).alias("nrs | 6"),   # 或运算
    (~pl.col("nrs")).alias("not nrs"),      # 取反
    (pl.col("nrs") ^ 6).alias("nrs ^ 6"),   # 异或运算
)

print(result)
```

```text
shape: (5, 5)
┌──────┬─────────┬─────────┬─────────┬─────────┐
│ nrs  ┆ nrs & 6 ┆ nrs | 6 ┆ not nrs ┆ nrs ^ 6 │
│ ---  ┆ ---     ┆ ---     ┆ ---     ┆ ---     │
│ i64  ┆ i64     ┆ i64     ┆ i64     ┆ i64     │
╞══════╪═════════╪═════════╪═════════╪═════════╡
│ 1    ┆ 0       ┆ 7       ┆ -2      ┆ 7       │
│ 2    ┆ 2       ┆ 6       ┆ -3      ┆ 4       │
│ 3    ┆ 2       ┆ 7       ┆ -4      ┆ 5       │
│ null ┆ null    ┆ null    ┆ null    ┆ null    │
│ 5    ┆ 4       ┆ 7       ┆ -6      ┆ 3       │
└──────┴─────────┴─────────┴─────────┴─────────┘
```


## 计数(唯一)值
`n_unique`可用于计算序列中唯一值的确切数量. 但是对于非常大的数据集, 此操作可能会非常缓慢.

在这种情况下, 如果近似值足够好, 可以使用`approx_n_unique`基于`HyperLogLog++`算法的函数来估算结果

```python
import numpy as np
import polars as pl
# 数据准备, 生成10万个随机数
long_df = pl.DataFrame({"numbers": np.random.randint(0, 100_000, 100_000)})

result = long_df.select(
    pl.col("numbers").n_unique().alias("n_unique"),
    pl.col("numbers").approx_n_unique().alias("approx_n_unique"),
)

print(result)
```

```text
shape: (1, 2)
┌──────────┬─────────────────┐
│ n_unique ┆ approx_n_unique │
│ ---      ┆ ---             │
│ u32      ┆ u32             │
╞══════════╪═════════════════╡
│ 63217    ┆ 63699           │
└──────────┴─────────────────┘
```

### `value_counts`: 获取有关唯一值及其计数的更多信息, `df`依然为最初提供的[数据](#数据准备)

```
result = df.select(
    pl.col("names").value_counts().alias("value_counts"),
)

print(result)
```

```text
shape: (4, 1)
┌──────────────┐
│ value_counts │
│ ---          │
│ struct[2]    │
╞══════════════╡
│ {"ham",1}    │
│ {"foo",1}    │
│ {"spam",2}   │
│ {"egg",1}    │
└──────────────┘
```


### `unique`,`unique_counts`: 让每个值只出现一次, 并且获取每个值出现的次数


```python
result = df.select(
    pl.col("names").unique().alias("unique"),
    pl.col("names").unique_counts().alias("unique_counts"),
)

print(result)
```
name这一列有两行`spam`, 其余都是一行

```text {9}
shape: (4, 2)
┌────────┬───────────────┐
│ unique ┆ unique_counts │
│ ---    ┆ ---           │
│ str    ┆ u32           │
╞════════╪═══════════════╡
│ foo    ┆ 1             │
│ ham    ┆ 1             │
│ spam   ┆ 2             │
│ egg    ┆ 1             │
└────────┴───────────────┘
```

## 条件语句
:::note

- Polars通过函数支持条件语句, 有三个函数: `when`,`then`,`otherwise`, 可以链式调用来完成自己的需求
- Polars不会"只执行满足条件的表达式", 而是: "并行执行所有表达式, 然后根据where条件决定用哪个结果"

:::


比如想新增一列color, groups值为A的, 就为red, 否则就为blue

下面的`then()`中如果是字符串, 会被解析为一个列, 如果想填充一个值, 请使用`pl.lit()`
```python
df.select(
    pl.col("groups"),
    pl.when(pl.col("groups")=="A").then(pl.lit("red")).otherwise(pl.lit("blue"))
)
```
```text
shape: (5, 2)
┌────────┬─────────┐
│ groups ┆ literal │
│ ---    ┆ ---     │
│ str    ┆ str     │
╞════════╪═════════╡
│ A      ┆ red     │
│ A      ┆ red     │
│ B      ┆ blue    │
│ A      ┆ red     │
│ B      ┆ blue    │
└────────┴─────────┘
```

:::tip
Polars是**条件选择**, 而不是条件执行

意思不是: "如果条件满足, 就执行该表达式, 否则就忽略"

而是: "并行执行所有表达式, 然后根据where条件决定用哪个结果"
:::
